/* @flow */

import * as aws from '../../aws/aws.js';
import type { DBMessage, BotParams, UserPrefs, RespondFn,
              CustomAIData, Conversation, ResponseMessage,
              AIActionRequest } from '../../misc/types.js';
import { CONSTANTS } from '../server-utils.js';
import { toStr, composeKeys, decomposeKeys } from '../../misc/utils.js';
import { runAction } from './ai-helpers.js';
import { converse as aiEngineConverse } from './conversational-engine/conversational-engine.js';
import _ from 'lodash';
import uuid from 'node-uuid';
const reportDebug = require('debug')('deepiks:custom-ai');
const reportError = require('debug')('deepiks:custom-ai:error');

type ConverseData =
    | { type: 'error', session: Object }
    | { type: 'stop', session: Object }
    | { type: 'msg', session: Object, msg: ResponseMessage }
    | { type: 'action', session: Object, action: string };

type ConverseRes = {
    userPrefs: UserPrefs,
    session: Object,
    context: Object,
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
    let converseData = await aiEngineConverse(text, userPrefs, session, context, botParams);
    return await converseHelper(text, originalMessage, context, userPrefs,
                                botParams, conversation, respondFn, converseData, 10);
}

async function converseHelper(
    text: string,
    originalMessage: DBMessage,
    context: Object,
    userPrefs: UserPrefs,
    botParams: BotParams,
    conversation: Conversation,
    respondFn: RespondFn,
    converseData: ConverseData,
    level: number
) : Promise<ConverseRes>
{
    reportDebug('converseHelper converseData: ', converseData);
    if (level < 0) {
        reportDebug('converseHelper: Max steps reached, stopping.');
        return { userPrefs, context, session: converseData.session };
    }

    if (!converseData.type) {
        throw new Error(`Couldn't find type in converseData`);
    }

    reportDebug('Response type: ', converseData.type);

    if (converseData.type === 'error') {
        throw new Error('Error in converseData');
    }

    if (converseData.type === 'stop') {
        return { userPrefs, context, session: converseData.session };
    }

    if (converseData.type === 'msg') {
        // will wait later
        const resP = respondFn({
            ...parseResponseMessage(converseData.msg),
            creationTimestamp: Date.now(),
        });
        const newConverseData = await aiEngineConverse(
            null, userPrefs, converseData.session, context, botParams
        );
        await resP;
        return await converseHelper(
            text, originalMessage, context, userPrefs, botParams,
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
            await aiEngineConverse(null, userPrefs, converseData.session, context, botParams);
        await resP;
        return await converseHelper(
            text, originalMessage, context, newUserPrefs, botParams,
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
            .map(([ action, ...args ]) => ({ action, args }))
        response.text = preprocessorMatch[2];
    }

    return response;
}

export async function ai(
    message: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn
) {
    reportDebug('ai message: ', message);
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);

    const [conversation, user] = await Promise.all([
        aws.getConversation(publisherId, botParams.botId, conversationId),
        aws.getUserByUserId(publisherId, botParams.botId, message.channel, message.senderId),
    ]);

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

    const { session, context, userPrefs: newUserPrefs } =
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
}

export default ai;

