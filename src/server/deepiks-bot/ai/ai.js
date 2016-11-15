/* @flow */

import * as aws from '../../../aws/aws.js';
import type { DBMessage, BotParams, RespondFn, Conversation } from '../../../misc/types.js';
import { toStr, composeKeys, decomposeKeys, timeout } from '../../../misc/utils.js';
import { CONSTANTS } from '../../server-utils.js';
import witAI from './wit-ai.js';
import { ai as customAI, learnFromHumanTransfer as customAILearn } from './custom-ai.js';
import { CONVERSE_STATUS_STUCK } from './ai-helpers.js';
import { send } from '../../channels/all-channels.js';
import { translations as tr, languages as langs } from '../../i18n/translations.js';
import _ from 'lodash';

const reportDebug = require('debug')('deepiks:ai');
const reportError = require('debug')('deepiks:ai:error');

export default async function ai(
    message: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn
) {
    reportDebug('ai');
    const strings = (tr[botParams.defaultLanguage] || tr[langs[0]]).ai;
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);
    const { botId } = botParams;
    const { channel } = message;

    const [conversation, user] = await Promise.all([
        aws.getConversation(publisherId, botId, conversationId),
        aws.getUserByUserId(publisherId, botId, channel, message.senderId),
    ]);

    // handle human response to a transferred conversation
    const ref = extractRefFromMessage(message, conversation);
    if (conversation.transferredConversations && ref) {
        const { text: responseContent, conversationId: refConversationId,
                expectsReply, senderName: refSenderName } = ref;
        const transFromConversation = await aws.getConversation(
            publisherId, botId, refConversationId
        );
        if (!expectsReply) {
            const transferredConversations = _.omit(
                conversation.transferredConversations, refConversationId
            );
            await Promise.all([
                aws.dynamoUpdate({
                    TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
                    Key: {
                        publisherId,
                        botId_conversationId: composeKeys(botId, conversationId),
                    },
                    UpdateExpression:
                        'SET transferredConversations = :tc',
                    ExpressionAttributeValues: {
                        ':tc': transferredConversations,
                    },
                }),
                aws.dynamoUpdate({
                    TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
                    Key: {
                        publisherId,
                        botId_conversationId: composeKeys(botId, refConversationId),
                    },
                    // TODO should we remove customAIData?
                    UpdateExpression: 'REMOVE transferredToHuman, customAIData',
                }),
            ]);
        }


        // learn if using custom AI
        if (!botParams.settings.witAccessToken) {
            customAILearn(
                responseContent, botParams, conversation,
                transFromConversation, expectsReply
            );
        }

        await send(botParams, transFromConversation, {
            text: responseContent,
            creationTimestamp: Date.now(),
        });

        await send(botParams, conversation, {
            text: strings.sentMessage(refSenderName),
            creationTimestamp: Date.now()+1,
        });

        return;
    }


    // call wit or custom AI
    const backend = botParams.settings.witAccessToken ? witAI : customAI;
    const converseStatus = await backend(message, botParams, conversation, user, respondFn);
    reportDebug('converseStatus: ', converseStatus);
    if (converseStatus !== CONVERSE_STATUS_STUCK) {
        return;
    }

    // transfer to human if possible

    const { humanTransfer } = botParams;
    if (!humanTransfer || humanTransfer.userId === message.senderId) {
        await respondFn({
            text: strings.didNotUnderstand,
            creationTimestamp: Date.now(),
        });
        return;
    }

    const transToUser = humanTransfer && await aws.getUserByUserId(
        publisherId, botId, humanTransfer.channel, humanTransfer.userId
    );
    reportDebug('humanTransfer:', humanTransfer);
    reportDebug('transToUser:', transToUser);

    if (!transToUser || !transToUser.isVerified || transToUser.userRole !== 'admin') {
        // send message to user
        await respondFn({
            text: strings.didNotUnderstand,
            creationTimestamp: Date.now(),
        });
        return;
    }


    reportDebug('transfer to human');

    const transToConversation = await aws.getConversation(
        publisherId, botId, transToUser.conversationId
    );
    reportDebug('transToConversation: ', transToConversation);
    const [, transToConversationId] =
        decomposeKeys(transToConversation.botId_conversationId);

    const transferredConversations = {
        ...transToConversation.transferredConversations,
        [conversationId]: {
            lastMessage: message,
        },
    };

    await Promise.all([
        aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
            Key: {
                publisherId,
                botId_conversationId: composeKeys(botId, transToConversationId),
            },
            UpdateExpression:
                'SET transferredConversations = :tc',
            ExpressionAttributeValues: {
                ':tc': transferredConversations,
            },
        }),
        aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
            Key: {
                publisherId,
                botId_conversationId: composeKeys(botId, conversationId),
            },
            UpdateExpression: 'SET transferredToHuman = :th',
            ExpressionAttributeValues: {
                ':th': true,
            },
        }),
    ]);

    // send message to the human
    // if new transfer
    if (!conversation.transferredToHuman) {
        const history = await createHistory(conversation, strings);
        reportDebug('history: ', history);
        await send(botParams, transToConversation, {
            text: history,
            creationTimestamp: Date.now(),
        });
        await timeout(500); // TODO quickfix
        await send(botParams, transToConversation, {
            text: strings.askForResponseWithHistory,
            creationTimestamp: Date.now()+1,
        });
    } else { // already transferred
        await send(botParams, transToConversation, {
            text: messageToText(message, strings),
            creationTimestamp: Date.now(),
        });
        await timeout(500); // TODO quickfix
        await send(botParams, transToConversation, {
            text: strings.askForResponseWithoutHistory,
            creationTimestamp: Date.now()+1,
        });

    }

    // send message to user
    await respondFn({
        text: strings.transferMessage,
        creationTimestamp: Date.now(),
    });
}

async function createHistory(conversation: Conversation, strings: Object): Promise<string> {
    const [, conversationId] = decomposeKeys(conversation.botId_conversationId);
    const qres = await aws.dynamoQuery({
        TableName: CONSTANTS.DB_TABLE_MESSAGES,
        KeyConditionExpression: 'publisherId_conversationId = :pc',
        ExpressionAttributeValues: {
            ':pc': composeKeys(conversation.publisherId, conversationId),
        },
        Limit: 5,
        ScanIndexForward: false,
    });
    const ms = qres.Items.map(x => messageToText(x, strings)).reverse();
    return ms.join('\n\n');
}

function messageToText(message: DBMessage, strings, Object) {
    const senderName = (message.senderName || '').trim().toLowerCase().replace(/\s+/g, '-');
    let text = `@${senderName}: `;
    text += message.text || '';
    if (!_.isEmpty(message.cards)) {
        text += `\n\n${strings.imagePlaceholder}`
    }
    return text.trim();
}

function extractRefFromMessage(message: DBMessage, conversation: Conversation) {
    reportDebug('extractRefFromMessage message.text:', message.text,
                'conversation.transferredConversations: ',
                conversation.transferredConversations);
    const inputMatch = (message.text || '').match(/^\s*@(.*?)\s+(.*)/);
    const tcs = conversation.transferredConversations;
    if (!inputMatch || _.isEmpty(tcs)) return null;
    const [, refName, content] = inputMatch;

    const simplifyName = x => x.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const simplifiedRefName = simplifyName(refName);
    const validConversationIds = Object.keys(tcs).filter(k => {
        const v = tcs[k];
        const sn = v.lastMessage.senderName || '';
        return sn.toLowerCase().startsWith(refName.toLowerCase()) ||
            simplifyName(sn).startsWith(simplifiedRefName);
    });
    reportDebug('extractRefFromMessage validConversationIds', validConversationIds);

    if (_.size(validConversationIds) !== 1) return null;
    const refConversationId = validConversationIds[0];

    const expectsReply = Boolean((message.text || '').match(/\?\s*$/));
    return {
        text: content,
        conversationId: refConversationId,
        expectsReply,
        senderName: tcs[refConversationId].lastMessage.senderName,
    }
}
