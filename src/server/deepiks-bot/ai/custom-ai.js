/* @flow */

import * as aws from '../../../aws/aws.js';
import type { DBMessage, BotParams, UserPrefs, RespondFn,
              User, Conversation, StuckStoryHandlerInfo,
              AIActionRequest, BotAIData } from '../../../misc/types.js';
import { CONSTANTS } from '../../server-utils.js';
import { toStr, composeKeys, decomposeKeys } from '../../../misc/utils.js';
import { runAction, extractPreprocessorActions,
         CONVERSE_STATUS_STOP, CONVERSE_STATUS_STUCK } from './ai-helpers.js';
import type { ConverseStatus } from './ai-helpers.js';
import { converse as aiEngineConverse,
         learnFromHumanTransfer as aiEngineLearnFromHumanTransfer
       } from '../conversational-engine/conversational-engine.js';
import type { ConverseData } from '../conversational-engine/conversational-engine.js';
import JSZip from 'jszip';
import _ from 'lodash';
import { inspect } from 'util';
const reportDebug = require('debug')('deepiks:custom-ai');
const reportError = require('debug')('deepiks:custom-ai:error');

type ConverseRes = {
    userPrefs: UserPrefs,
    session: Object,
    context: Object,
    status: ConverseStatus,
};

async function converse(
    text: string,
    originalMessage: DBMessage,
    session: Object,
    context: Object,
    userPrefs: UserPrefs,
    botParams: BotParams,
    conversation: Conversation,
    respondFn: RespondFn
) : Promise<ConverseRes>
{
    const botAIData = await getBotAIData(botParams);
    if (!botAIData) {
        throw new Error('converse failed to get/parse bot AI data from S3');
    }

    let converseData = await aiEngineConverse(
        text, session, context, botAIData, botParams.defaultLanguage
    );
    return await converseHelper(
        text, originalMessage, context, userPrefs, botAIData, botParams,
        conversation, respondFn, converseData, 10
    );
}

async function converseHelper(
    text: string,
    originalMessage: DBMessage,
    context: Object,
    userPrefs: UserPrefs,
    botAIData: BotAIData,
    botParams: BotParams,
    conversation: Conversation,
    respondFn: RespondFn,
    converseData: ConverseData,
    level: number
) : Promise<ConverseRes>
{
    reportDebug('converseHelper converseData: ', converseData);
    if (level < 0) {
        throw new Error('converseHelper: Max steps reached');
    }

    if (!converseData.type) {
        throw new Error(`Couldn't find type in converseData`);
    }

    reportDebug('Response type: ', converseData.type);

    if (converseData.type === 'error') {
        throw new Error('Error in converseData');
    }

    if (converseData.type === 'stop') {
        return { userPrefs, context, session: converseData.session, status: CONVERSE_STATUS_STOP };
    }

    if (converseData.type === 'stuck') {
        return { userPrefs, context, session: converseData.session, status: CONVERSE_STATUS_STUCK };
    }

    if (converseData.type === 'msg') {
        // will wait later
        const resP = respondFn({
            ...parseResponseMessage(converseData.msg),
            creationTimestamp: Date.now(),
        });
        const newConverseData = await aiEngineConverse(
            null, converseData.session, context, botAIData, botParams.defaultLanguage
        );
        await resP;
        return await converseHelper(
            text, originalMessage, context, userPrefs, botAIData, botParams,
            conversation, respondFn, newConverseData, level-1
        );

    } else if (converseData.type === 'action') {
        let actionRequest: AIActionRequest = {
            sessionId: conversation.botId_conversationId, // TODO delete this
            entities: {},
            context,
            userPrefs,
            text,
            publisherId: botParams.publisherId,
            botId: botParams.botId,
        };
        const actionRes = await runAction(
            converseData.action, actionRequest, originalMessage, botParams);
        reportDebug('action returned: ', actionRes);
        const newContext = actionRes.context || {};
        const newUserPrefs = _.has(actionRes, 'userPrefs')
            ? actionRes.userPrefs || {}
            : userPrefs;

        let resP = Promise.resolve();
        if (actionRes.msg) {
            resP = respondFn({
                ...actionRes.msg,
                creationTimestamp: Date.now(),
            });
        }
        // const newCustomAIData = {
        //     context: newContext,
        //     session: customAIData.session,
        // };
        const newConverseData =
            await aiEngineConverse(
                null, converseData.session, context, botAIData, botParams.defaultLanguage
            );
        await resP;
        return await converseHelper(
            text, originalMessage, context, newUserPrefs, botAIData, botParams,
            conversation, respondFn, newConverseData, level-1
        );
    }

    reportError('unknown response type', converseData);
    throw new Error(`unknown response type ${converseData.type}`);
}

function parseResponseMessage(msg) {
    const response = { ...msg };

    const extracted = extractPreprocessorActions(msg.text || '');
    if (extracted) {
        response.preprocessorActions = extracted.actions;
        response.text = extracted.text;
    }

    return response;
}

// TODO cache stories
async function getBotAIData(botParams): Promise<?BotAIData> {
    const { publisherId, botId } = botParams;
    const res = await aws.s3GetObject({
        Bucket: CONSTANTS.S3_BUCKET_NAME,
        Key: `${publisherId}/${botId}/bot.zip`,
    });
    if (!res) return null;

    // const stories = await getStoriesFromZipBuffer(res.Body);
    const zip = await JSZip.loadAsync(res.Body);
    const storiesStr = await zip.file('stories.json').async('string');
    const stories = JSON.parse(storiesStr);

    const actionsFile = zip.file('actions.json');
    const actionsStr = actionsFile && (await actionsFile.async('string'));
    const actions = actionsStr && JSON.parse(actionsStr) || { data: [] };

    const expressionsFile = zip.file('expressions.json');
    const expressionsStr = expressionsFile && (await expressionsFile.async('string'));
    const expressions = expressionsStr && JSON.parse(expressionsStr) || { data: [] };

    reportDebug('getBotAIData stories: ', inspect(stories, { depth: null }));
    reportDebug('getBotAIData actions: ', inspect(actions, { depth: null }));
    reportDebug('getBotAIData expressions: ', inspect(actions, { depth: null }));
    return {
        stories: stories.data,
        actions: actions.data,
        expressions: expressions.data,
    };
}

export async function ai(
    message: DBMessage,
    botParams: BotParams,
    conversation: Conversation,
    user: User,
    respondFn: RespondFn
) : Promise<ConverseStatus> {
    reportDebug('ai message: ', message);
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);

    const userPrefs = user && user.prefs || {};
    reportDebug('ai userPrefs: ', userPrefs);

    let text = message.text;
    if (message.cards && message.cards.length) {
        const imageUrl = _.last(message.cards).imageUrl;
        text = `${text || ''} ${imageUrl || ''}`.trim();
    }
    if (!text) {
        return CONVERSE_STATUS_STOP;
    }
    const oldCustomAIData = conversation.customAIData || {};

    const { session, context, userPrefs: newUserPrefs, status } =
        await converse(text, message,
                       oldCustomAIData.session || {},
                       oldCustomAIData.context || {},
                       userPrefs, botParams, conversation, respondFn);

    await Promise.all([
        aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
            Key: {
                publisherId,
                botId_conversationId: composeKeys(botParams.botId, conversationId),
            },
            UpdateExpression: 'SET customAIData = :cad',
            ExpressionAttributeValues: {
                ':cad': aws.dynamoCleanUpObj({ session, context }),
            },
        }),
        aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_USERS,
            Key: {
                publisherId,
                botId_channel_userId: composeKeys(botParams.botId, message.channel, message.senderId),
            },
            UpdateExpression: 'SET prefs = :prefs',
            ExpressionAttributeValues: {
                ':prefs': aws.dynamoCleanUpObj(newUserPrefs),
            },
        }),
    ]);

    return status;
}

export async function learnFromHumanTransfer(
    responseText: string, botParams: BotParams, toConversation: Conversation,
    originConversation: Conversation, expectsReply: boolean
) {
    const botAIData = await getBotAIData(botParams);
    if (!botAIData) {
        throw new Error('learnFromHumanTransfer failed to get/parse bot AI data from S3');
    }

    const { publisherId, botId } = botParams;
    const cad = originConversation.customAIData || {};
    const oci = decomposeKeys(originConversation.botId_conversationId)[1];
    const originalMessage = toConversation.transferredConversations[oci].lastMessage;
    const res = aiEngineLearnFromHumanTransfer(
        responseText, originalMessage, cad.session || {}, botAIData, expectsReply
    );
    reportDebug('aiEngineLearnFromHumanTransfer returned ', inspect(res, { depth: null }));

    // update conversations table
    const updateConversationsP = aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
        Key: {
            publisherId: publisherId,
            botId_conversationId: composeKeys(botId, oci),
        },
        UpdateExpression: 'SET customAIData = :cad',
        ExpressionAttributeValues: {
            ':cad': aws.dynamoCleanUpObj({
                session: res.session,
                context: cad.context || {},
            }),
        },
    });

    // zip stories.json into bot.zip and upload to s3
    const zip = new JSZip();
    zip.file('stories.json', JSON.stringify({ data: res.stories }, null, ' '));
    zip.file('actions.json', JSON.stringify({ data: res.actions }, null, ' '));
    zip.file('expressions.json', JSON.stringify({ data: res.expressions }, null, ' '));
    const zipStream = zip.generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true,
    });

    await aws.s3Upload({
        Bucket: CONSTANTS.S3_BUCKET_NAME,
        Key: `${publisherId}/${botId}/bot.zip`,
        Body: zipStream,
    });

    await updateConversationsP;
}

export async function getStuckStoryHandlerInfo(botParams: BotParams)
: Promise<?StuckStoryHandlerInfo>
{
    // TODO cache botAIData
    const botAIData = await getBotAIData(botParams);
    if (!botAIData) {
        throw new Error('getStuckStoryHandlerInfo failed to get/parse bot AI data from S3');
    }

    // find the story where its first user message is CONSTANTS.HUMAN_TRANSFER_INDICATOR
    // then find its operation which is a template action which has the `transfer`
    // preprocessor action with at least 2 arguments
    const story = botAIData.stories.find(x => {
        const u = _.get(x, ['turns', 0, 'user'], '').trim().toLowerCase();
        return u === CONSTANTS.HUMAN_TRANSFER_INDICATOR;
    });
    const actions =
        _.get(story, ['turns', 0, 'operations'], [])
        .filter(a => a.action)
        .map(a => botAIData.actions.find(b => b.id === a.action))
        .map(a => a && a.template && (extractPreprocessorActions(a.template) || { text: a.template }))
        .map(a => a && {
            text: a.text,
            action: a.actions && a.actions.find(
                x => (x.action === 'transfer' && x.args[0] && x.args[1]) ||
                     (x.action === 'transferroom' && x.args[0])
            )
        })
        .filter(a => a && (a.text || a.action));

    reportDebug('getStuckStoryHandlerInfo actions: ', actions);
    if (actions.length === 0) return null;

    const a0 = actions[0];
    let humanTransferDest;
    if (a0.action) {
        if (a0.action.action === 'transfer') {
            humanTransferDest = {
                channel: a0.action.args[0],
                userId: a0.action.args[1],
                conversationId: a0.action.args[1],
                learn: (a0.action.args[2] || '').toLowerCase() === 'learn',
                transferIndicatorMessage: a0.text,
            };
        } else if (a0.action.action === 'transferroom') {
            humanTransferDest = {
                conversationId: a0.action.args[0],
                learn: (a0.action.args[1] || '').toLowerCase() === 'learn',
                transferIndicatorMessage: a0.text,
            };
        }
    }
    return {
        humanTransferDest,
        text: a0.text,
    };
}
