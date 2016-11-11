/* @flow */

import * as aws from '../../../aws/aws.js';
import type { DBMessage, BotParams, UserPrefs, RespondFn,
              User, Conversation, ResponseMessage,
              AIActionRequest } from '../../../misc/types.js';
import { CONSTANTS } from '../../server-utils.js';
import { toStr, composeKeys, decomposeKeys } from '../../../misc/utils.js';
import { runAction, CONVERSE_STATUS_STOP, CONVERSE_STATUS_STUCK } from './ai-helpers.js';
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
    const stories = await getStoriesFromS3(botParams);
    reportDebug('converse stories: ', stories);
    if (!stories) {
        throw new Error('converse no stories found');
    }

    let converseData = aiEngineConverse(
        text, session, context, stories
    );
    return await converseHelper(
        text, originalMessage, context, userPrefs, stories, botParams,
        conversation, respondFn, converseData, 10
    );
}

async function converseHelper(
    text: string,
    originalMessage: DBMessage,
    context: Object,
    userPrefs: UserPrefs,
    stories: Object,
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
        const newConverseData = aiEngineConverse(
            null, converseData.session, context, stories
        );
        await resP;
        return await converseHelper(
            text, originalMessage, context, userPrefs, stories, botParams,
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
            aiEngineConverse(null, converseData.session, context, stories);
        await resP;
        return await converseHelper(
            text, originalMessage, context, newUserPrefs, stories, botParams,
            conversation, respondFn, newConverseData, level-1
        );
    }

    reportError('unknown response type', converseData);
    throw new Error(`unknown response type ${converseData.type}`);
}

function parseResponseMessage(msg) {
    const response = { ...msg };
    // check for preprocessor actions inside the message
    // e.g. "<[DELAY:60]> some message"
    const preprocessorMatch = (msg.text || '').match(/^\s*<\[(.*?)\]>\s*(.*)/);
    if (preprocessorMatch) {
        response.preprocessorActions = preprocessorMatch[1]
            .split(';')
            .map(command => command
                .split(':')
                .map(x => x.trim().toLowerCase())
                .filter(Boolean)
            )
            .filter(x => x.length > 0)
            .map(([ action, ...args ]) => ({ action, args }));
        response.text = preprocessorMatch[2];
    }

    return response;
}

// TODO cache stories
async function getStoriesFromS3(botParams) {
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

    reportDebug('getStoriesFromS3 stories: ', inspect(stories, { depth: null }));
    return stories.data;
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
        text = `${text || ''} ${_.last(message.cards).imageUrl}`;
    }
    if (!text) {
        return;
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
    const stories = await getStoriesFromS3(botParams);
    if (!stories) {
        throw new Error('learnFromHumanTransfer failed to get/parse stories from S3');
    }

    const { publisherId, botId } = botParams;
    const cad = originConversation.customAIData || {};
    const oci = decomposeKeys(originConversation.botId_conversationId)[1];
    const originalMessage = toConversation.transferredConversations[oci].lastMessage;
    const res = aiEngineLearnFromHumanTransfer(
        responseText, originalMessage, cad.session || {}, stories, expectsReply
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

