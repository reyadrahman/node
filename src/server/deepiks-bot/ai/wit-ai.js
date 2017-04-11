/* @flow */

import * as aws from '../../../aws/aws.js';
import type { DBMessage, BotParams, UserPrefs, WitData, User, Conversation,
              RespondFn, AIActionRequest } from '../../../misc/types.js';
import { CONSTANTS } from '../../server-utils.js';
import { toStr, composeKeys, decomposeKeys } from '../../../misc/utils.js';
import { runAction, CONVERSE_STATUS_STOP, extractPreprocessorActions } from './ai-helpers.js';
import type { ConverseStatus } from './ai-helpers.js';
import { Wit, log as witLog } from 'node-wit';
import _ from 'lodash';
import uuid from 'node-uuid';
const reportDebug = require('debug')('deepiks:wit-ai');
const reportError = require('debug')('deepiks:wit-ai:error');
const witLogger = require('debug')('deepiks:wit');

type RunActionsRes = {
    witData: WitData,
    userPrefs: UserPrefs,
};

function mkClient(accessToken: string, respondFn: RespondFn) {
    return new Wit({
        accessToken,
        respondFn,
        actions: {
            // dummy
            send(a,b) {}
        },
        logger: new witLog.Logger(witLogger)
    });
}

async function runActions(
    client: Wit,
    text: string,
    originalMessage: DBMessage,
    witData: WitData,
    userPrefs: UserPrefs,
    botParams: BotParams
) : Promise<RunActionsRes>
{
    let converseData = await client.converse(witData.sessionId, text, {
        ...witData.context,
        userPrefs,
    });
    return await runActionsHelper(client, text, originalMessage, witData,
                                   userPrefs, botParams, converseData, 10);
}

async function runActionsHelper(
    client: Wit,
    text: string,
    originalMessage: DBMessage,
    witData: WitData,
    userPrefs: UserPrefs,
    botParams: BotParams,
    converseData: Object,
    level: number
) : Promise<RunActionsRes>
{
    reportDebug('runActionsHelper: converseData: ', converseData);
    if (level < 0) {
        reportDebug('runActionsHelper: Max steps reached, stopping.');
        return { userPrefs, witData };
    }

    if (!converseData.type) {
        throw new Error(`Couldn't find type in Wit response`);
    }

    reportDebug('witData: ', witData);
    reportDebug('Response type: ', converseData.type);

    // backwards-cpmpatibility with API version 20160516
    if (converseData.type === 'merge') {
        converseData.type = 'action';
        converseData.action = 'merge';
    }

    if (converseData.type === 'error') {
        throw new Error('Oops, I don\'t know what to do.');
    }

    if (converseData.type === 'stop') {
        return { userPrefs, witData };
    }

    const requestData: AIActionRequest = {
        sessionId: witData.sessionId,
        context: witData.context,
        userPrefs,
        text,
        entities: converseData.entities,
        publisherId: botParams.publisherId,
        botId: botParams.botId,
    };

    if (converseData.type === 'msg') {
        // will wait later
        const resP = client.config.respondFn({
            ...converseDataToResponseMessage(converseData),
            creationTimestamp: Date.now(),
        });
        const newConverseData = await client.converse(witData.sessionId, null, {
            ...witData.context,
            userPrefs,
        });
        await resP;
        return await runActionsHelper(client, text, originalMessage, witData,
                                      userPrefs, botParams, newConverseData, level-1);

    } else if (converseData.type === 'action') {
        if (!converseData.action) {
            // this is bug in wit
            // see https://github.com/wit-ai/node-wit/issues/5
            reportDebug('runActionsHelper skipping null action');
            const newConverseData = await client.converse(witData.sessionId, null, {
                ...witData.context,
                userPrefs,
            });
            return await runActionsHelper(client, text, originalMessage, witData,
                                          userPrefs, botParams, newConverseData, level-1);
        }

        let actionFullName = converseData.action;
        let newWitData = witData;
        let newRequestData = requestData;
        const sepIndex = actionFullName.indexOf('_');
        const prefix = sepIndex > 0 ? actionFullName.split('_')[0] : '';
        const action = sepIndex > 0 ? actionFullName.substr(sepIndex+1) : actionFullName;
        reportDebug(`prefix: ${prefix}`);
        reportDebug(`action: ${action}`);
        if (prefix !== witData.lastActionPrefix && (prefix || witData.lastActionPrefix)) {
            reportDebug(`Story changed from "${witData.lastActionPrefix || 'N/A'}" to "${prefix}"`);
            reportDebug(`Resetting context...`);
            newWitData = {
                ...witData,
                context: {},
                lastActionPrefix: prefix,
            };
            newRequestData = {
                ...requestData,
                context: {},
            }
        }
        const actionRes =
            await runAction(action, newRequestData, originalMessage, botParams) || {};
        reportDebug('action returned: ', actionRes);
        newWitData.context = actionRes.context || {};
        const newUserPrefs = _.has(actionRes, 'userPrefs')
            ? actionRes.userPrefs || {}
            : userPrefs;

        let resP = Promise.resolve();
        if (actionRes.msg) {
            resP = client.config.respondFn({
                ...actionRes.msg,
                creationTimestamp: Date.now(),
            });
        }
        const newConverseData = await client.converse(newWitData.sessionId, null, {
            ...newWitData.context,
            userPrefs,
        });
        await resP;
        return await runActionsHelper(client, text, originalMessage, newWitData,
                                      newUserPrefs, botParams, newConverseData,
                                      level-1)
    } else {
        reportError('unknown response type', converseData);
        throw new Error(`unknown response type ${converseData.type}`);
    }
}

function converseDataToResponseMessage(converseData) {
    const response = {};
    const extracted = extractPreprocessorActions(converseData.msg || '');
    if (extracted) {
        response.preprocessorActions = extracted.actions;
        response.text = extracted.text;
    } else {
        response.text = converseData.msg;
    }

    if (converseData.quickreplies) {
        response.actions = converseData.quickreplies.map(x => ({ text: x, fallback: x }));
    }
    return response;
}

export async function ai(
    message: DBMessage,
    botParams: BotParams,
    conversation: Conversation,
    user: User,
    respondFn: RespondFn
) : Promise<ConverseStatus> {
    reportDebug('ai message: ', message);
    if (!botParams.settings.witAccessToken) {
        throw new Error(`Bot doesn't have witAccessToken: ${toStr(botParams)}`);
    }

    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);

    const witData = Object.assign({
        sessionId: uuid.v4(),
        context:   {channel: conversation.channel},
    }, conversation.witData);
    reportDebug('ai: witData: ', witData);


    const userPrefs = user && user.prefs || {};
    reportDebug('ai userPrefs : ', userPrefs);


    let text = (message.text || '').substr(0, 150);
    if (message.cards && message.cards.length) {
        const imageUrl = _.last(message.cards).imageUrl;
        text = `${text || ''} ${imageUrl || ''}`.trim();
    }
    if (!text) {
        return CONVERSE_STATUS_STOP;
    }

    const client = mkClient(botParams.settings.witAccessToken, respondFn);
    const { witData: newWitData, userPrefs: newUserPrefs } =
        await runActions(client, text, message, witData, userPrefs, botParams);

    await Promise.all([
        aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
            Key: {
                publisherId,
                botId_conversationId: composeKeys(botParams.botId, conversationId),
            },
            UpdateExpression: 'SET witData = :witData',
            ExpressionAttributeValues: {
                ':witData': aws.dynamoCleanUpObj(newWitData),
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

    return CONVERSE_STATUS_STOP;
}

export default ai;
