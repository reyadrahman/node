/* @flow */

import * as aws from '../../../aws/aws.js';
import type { DBMessage, BotParams, RespondFn, Conversation,
              StuckStoryHandlerInfo } from '../../../misc/types.js';
import { toStr, composeKeys, decomposeKeys, timeout } from '../../../misc/utils.js';
import { CONSTANTS } from '../../server-utils.js';
import witAI from './wit-ai.js';
import { ai as customAI,
         learnFromHumanTransfer as customAILearn,
         getStuckStoryHandlerInfo } from './custom-ai.js';
import { CONVERSE_STATUS_STUCK } from './ai-helpers.js';
import { send } from '../../channels/all-channels.js';
import { translations as tr, languages as langs } from '../../i18n/translations.js';
import _ from 'lodash';
import moment from 'moment';

const reportDebug = require('debug')('deepiks:ai');
const reportError = require('debug')('deepiks:ai:error');

type Mention = {
    text: string,
    conversationId: string,
    expectsReply: boolean,
    senderName: string,
};

export async function ai(
    message: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn
) {
    reportDebug('ai');
    const strings = (tr[botParams.defaultLanguage] || tr[langs[0]]).ai;
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);
    const {botId} = botParams;
    const {channel} = message;

    const [conversation, user] = await Promise.all([
        aws.getConversation(publisherId, botId, conversationId),
        aws.getUserByUserId(publisherId, botId, channel, message.senderId),
    ]);

    const mention = extractMentionFromMessage(message, conversation);
    if (conversation.transferredConversations && mention) {
        await respondToTransferredConversation(message, conversation, mention, botParams);
        return;
    }

    // call wit or custom AI
    const backend = botParams.settings.witAccessToken ? witAI : customAI;
    const converseStatus = await backend(message, botParams, conversation, user, respondFn);
    reportDebug('ai converseStatus: ', converseStatus);
    let transfer = converseStatus === CONVERSE_STATUS_STUCK;


    if (transfer) {
        let humanTransferDest = conversation.humanTransferDest;
        let responseText = null;
        if (!humanTransferDest) {
            const sshi = await getStuckStoryHandlerInfo(botParams);
            humanTransferDest = sshi && sshi.humanTransferDest;
            if (!humanTransferDest) {
                responseText = sshi.text;
            }
        }

        reportDebug('ai humanTransferDest: ', humanTransferDest,
                    'responseText: ', responseText);
        await conversationIsStuck(
            message, conversation, botParams, respondFn, humanTransferDest, responseText
        );
    }
}

async function removeHumanTransferDest(publisherId, botId, conversationId) {
    await aws.dynamoUpdate({
        TableName:        CONSTANTS.DB_TABLE_CONVERSATIONS,
        Key:              {
            publisherId,
            botId_conversationId: composeKeys(botId, conversationId),
        },
        UpdateExpression: 'REMOVE humanTransferDest',
    })
}


async function respondToTransferredConversation(
    message: DBMessage,
    conversation: Conversation,
    mention: Mention,
    botParams: BotParams,
) {
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);
    const {botId} = botParams;
    const strings = (tr[botParams.defaultLanguage] || tr[langs[0]]).ai;

    const {
        text: responseContent, conversationId: mentionedConversationId,
        expectsReply, senderName: mentionedSenderName
    } = mention;
    const transFromConversation = await aws.getConversation(
        publisherId, botId, mentionedConversationId
    );
    if (!expectsReply) {
        const transferredConversations = _.omit(
            conversation.transferredConversations, mentionedConversationId
        );
        await Promise.all([
            aws.dynamoUpdate({
                TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
                Key: {
                    publisherId,
                    botId_conversationId: composeKeys(botId, conversationId),
                },
                UpdateExpression: 'SET transferredConversations = :tc',
                ExpressionAttributeValues: {
                    ':tc': transferredConversations,
                },
            }),
            aws.dynamoUpdate({
                TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
                Key: {
                    publisherId,
                    botId_conversationId: composeKeys(botId, mentionedConversationId),
                },
                // TODO should we remove customAIData?
                UpdateExpression: 'REMOVE humanTransferDest, customAIData',
            }),
        ]);
    }


    // learn if using custom AI and learn is set
    if (!botParams.settings.witAccessToken) {
        const sshi = await getStuckStoryHandlerInfo(botParams);
        if (sshi && sshi.humanTransferDest && sshi.humanTransferDest.learn) {
            await customAILearn(
                responseContent, botParams, conversation,
                transFromConversation, expectsReply
            );
        }
    }

    await send(botParams, transFromConversation, {
        text: responseContent,
        creationTimestamp: Date.now(),
    });

    await send(botParams, conversation, {
        text: strings.sentMessage(mentionedSenderName),
        creationTimestamp: Date.now() + 1,
    });
}

export async function conversationIsStuck(
    message: DBMessage,
    conversation: Conversation,
    botParams: BotParams,
    respondFn: RespondFn,
    humanTransferDest: ?HumanTransferDest,
    responseText: ?string,
) {
    reportDebug('conversationIsStuck called, humanTransferDest: ',
                humanTransferDest, ', responseText: ', responseText);
    const strings = (tr[botParams.defaultLanguage] || tr[langs[0]]).ai;
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);
    const {botId} = botParams;

    if (!humanTransferDest) {
        await respondFn({
            text: responseText || strings.didNotUnderstand,
            creationTimestamp: Date.now(),
        });
        return;
    }

    if (humanTransferDest.userId === message.senderId ||
        humanTransferDest.conversationId === conversationId)
    {
        await respondFn({
            text: strings.didNotUnderstand,
            creationTimestamp: Date.now(),
        });

        // I guess this means transfer dest is incorrect,
        // so let's remove it and force AI to process user messages again
        await removeHumanTransferDest(publisherId, botId, conversationId);
        return;
    }

    let transToConversation;
    if (humanTransferDest.userId) { // transferring to user
        const transToUser = await aws.getUserByUserId(
            publisherId, botId, humanTransferDest.channel, humanTransferDest.userId
        );
        reportDebug('transToUser humann:', transToUser);

        if (!transToUser ||  transToUser.userRole !== 'admin') {
            // send message to user
            await respondFn({
                text: "Not allowed",
                creationTimestamp: Date.now(),
            });
            return;
        }

        reportDebug('transferring to human...');

        transToConversation = await aws.getConversation(
            publisherId, botId, transToUser.conversationId
        );
    } else { // transferring to conversation
        transToConversation = await aws.getConversation(
            publisherId, botId, humanTransferDest.conversationId
        );

    }

    if (!transToConversation) {
        await respondFn({
            text: 'A problem occured when transfering',
            creationTimestamp: Date.now(),
        });

        // I guess this means transfer dest is incorrect,
        // so let's remove it and force AI to process user messages again
        await removeHumanTransferDest(publisherId, botId, conversationId);
        return;
    }

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
            UpdateExpression: 'SET humanTransferDest = :htd',
            ExpressionAttributeValues: {
                ':htd': humanTransferDest,
            },
        }),
    ]);

    // send message to the human
    if (!conversation.humanTransferDest) { // if new transfer
        const history = await createHistory(conversation, strings);
        reportDebug('history: ', history);

        if (transToConversation.channel === 'email') {
            await send(botParams, transToConversation, {
                text:              `${history}\n\n${strings.askForResponseWithHistory}`,
                creationTimestamp: Date.now(),
            });
        } else {
            await send(botParams, transToConversation, {
                text:              history,
                creationTimestamp: Date.now(),
            });
            await timeout(500); // TODO quickfix
            await send(botParams, transToConversation, {
                text:              strings.askForResponseWithHistory,
                creationTimestamp: Date.now() + 1,
            });
        }

    } else { // already transferred
        if (transToConversation.channel === 'email') {
            await send(botParams, transToConversation, {
                text:              `${messageToText(message, strings)}\n\n${strings.askForResponseWithoutHistory}`,
                creationTimestamp: Date.now(),
            });
        } else {
            await send(botParams, transToConversation, {
                text:              messageToText(message, strings),
                creationTimestamp: Date.now(),
            });
            await timeout(500); // TODO quickfix
            await send(botParams, transToConversation, {
                text:              strings.askForResponseWithoutHistory,
                creationTimestamp: Date.now() + 1,
            });
        }

    }

    // send message to user
    await respondFn({
        text: responseText ||
            humanTransferDest.transferIndicatorMessage ||
            strings.transferMessage,
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

function messageToText(message: DBMessage, strings: Object) {
    const senderName = (message.senderName || '').trim().toLowerCase().replace(/\s+/g, '-');
    const timestamp = moment(message.creationTimestamp).format('hh:mm A');
    const direction = message.senderIsBot ? '<' : '>';
    let text = `${direction} [${timestamp}] **@${senderName}:** `;
    text += (message.text || '').replace(/\n\n/g, '\n\n> ');
    if (!_.isEmpty(message.cards)) {
        text += `\n\n> ${strings.imagePlaceholder}`
    }
    return text.trim();
}

function extractMentionFromMessage(message: DBMessage, conversation: Conversation)
: ?Mention {
    reportDebug('extractMentionFromMessage message.text:', message.text,
                'conversation.transferredConversations: ',
                conversation.transferredConversations);
    const inputMatch = (message.text || '').match(/^\s*@(.*?)\s+(.*)/);
    const tcs = conversation.transferredConversations;
    if (!inputMatch || _.isEmpty(tcs)) return null;
    const [, mentionedName, content] = inputMatch;

    const simplifyName = x => x.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const simplifiedMentionedName = simplifyName(mentionedName);
    const validConversationIds = Object.keys(tcs).filter(k => {
        const v = tcs[k];
        const sn = v.lastMessage.senderName || '';
        return sn.toLowerCase().startsWith(mentionedName.toLowerCase()) ||
            simplifyName(sn).startsWith(simplifiedMentionedName);
    });
    reportDebug('extractMentionFromMessage validConversationIds', validConversationIds);

    if (_.size(validConversationIds) !== 1) return null;
    const mentionedConversationId = validConversationIds[0];

    const expectsReply = Boolean((message.text || '').match(/\?\s*$/));
    return {
        text: content,
        conversationId: mentionedConversationId,
        expectsReply,
        senderName: tcs[mentionedConversationId].lastMessage.senderName,
    }
}
