/* @flow */

import * as aws from '../../aws/aws.js';
import type { DBMessage, ResponseMessage, BotParams, ActionRequest,
              ActionResponse, UserPrefs, WitData, RespondFn } from '../../misc/types.js';
import { CONSTANTS, request } from '../server-utils.js';
import { toStr, catchPromise, callbackToPromise,
         composeKeys, decomposeKeys } from '../../misc/utils.js';
import { Wit, log as witLog } from 'node-wit';
import _ from 'lodash';
import URL from 'url';
import uuid from 'node-uuid';
const reportDebug = require('debug')('deepiks:ai');
const reportError = require('debug')('deepiks:ai:error');

type ActionRequestIncomplete = {
    sessionId: string,
    context: Object,
    userPrefs: UserPrefs,
    text: string,
    entities: Object,
    publisherId: string,
    botId: string,
};

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
            send() {}
        },
        logger: new witLog.Logger(witLog.DEBUG)
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

    const requestData = {
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
            await runAction(action, newRequestData, originalMessage, botParams,
                            client.config.actions) || {};
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

async function runAction(
    actionName: string,
    actionRequest: ActionRequestIncomplete,
    originalMessage: DBMessage,
    botParams: BotParams,
    localActions: {[key: string]: Function})
{
    reportDebug('runAction: ')
    reportDebug('\t actionName: ', actionName);
    reportDebug('\t actionRequest: ', toStr(actionRequest));
    const { publisherId } = botParams;
    const { senderId } = originalMessage;
    if (!senderId) {
        throw new Error(`ERROR: runAction senderId: ${senderId || ''}`);
    }
    const federationToken = await aws.stsGetFederationToken({
        Name: uuid.v4().substr(0, 30),
        DurationSeconds: 15 * 60,
        Policy: generateS3Policy(publisherId, senderId),
    });
    const credentials = federationToken.Credentials;
    reportDebug('got federationToken: ', federationToken);
    const requestData: ActionRequest = {
        ...actionRequest,
        // action: actionName,
        credentials: {
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
            expiration: credentials.Expiration,
        },
        s3: {
            bucket: CONSTANTS.S3_BUCKET_NAME,
            prefix: `${publisherId}/${senderId}/`,
        }
    }
    if (localActions[actionName]) {
        return await localActions[actionName](requestData);
    }

    const action = await aws.getAIAction(actionName);
    reportDebug('runAction: ', action);
    if (action.url) {
        const res = await request({
            uri: action.url,
            method: 'POST',
            json: true,
            body: requestData,
        });

        if (res.statusCode === 200) {
            reportDebug('runAction url, returned: ', toStr(res.body));
            return res.body;
        } else {
            throw new Error(`runAction url, returned error code ${res.statusCode}`
                          + ` and body: ${JSON.stringify(res.body)}`);
        }
    }
    else if (action.lambda){
        const { lambda } = action;
        const res = await aws.lambdaInvoke({
            FunctionName: lambda,
            Payload: JSON.stringify(requestData),
        });
        reportDebug('lambda returned: ', toStr(res));
        if (res.StatusCode !== 200) {
            throw new Error(`lambda ${lambda} returned status code ${res.StatusCode}`);
        }
        const resPayload = JSON.parse(res.Payload);
        if (!resPayload.context){
            throw new Error(`lambda ai action named ${lambda} did not return a context: ` +
                            toStr(resPayload));
        }
        return resPayload;
    }

    throw new Error(`Unknown action: ${toStr(action)}`);
}

function generateS3Policy(publisherId: string, senderId: string): string {
    return JSON.stringify({
        Version: '2012-10-17',
        Statement: [
            {
                Effect: 'Allow',
                Action: [
                    's3:GetObject',
                    's3:PutObject',
                ],
                Resource: [
                    `arn:aws:s3:::${CONSTANTS.S3_BUCKET_NAME}/${publisherId}/${senderId}/*`,
                ]
            }
        ]
    });
}

function converseDataToResponseMessage(converseData) {
    const response = {};
    // check for preprocessor actions inside the message
    // e.g. "<[DELAY:60]> some message"
    const preprocessorMatch = (converseData.msg || '').match(/^\s*<\[(.*?)\]>\s*(.*)/);
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
    } else {
        response.text = converseData.msg;
    }

    if (converseData.quickreplies) {
        response.actions = converseData.quickreplies.map(x => ({ text: x, fallback: x }));
    }
    return response;
}

export async function ai(message: DBMessage,
                         botParams: BotParams,
                         respondFn: RespondFn)
{
    reportDebug('ai message: ', message);
    if (!botParams.settings.witAccessToken) {
        throw new Error(`Bot doesn't have witAccessToken: ${toStr(botParams)}`);
    }

    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);


    const [convQueryRes, user] = await Promise.all([
        aws.dynamoQuery({
            TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
            KeyConditionExpression: 'publisherId = :publisherId and botId_conversationId = :bc',
            ExpressionAttributeValues: {
                ':publisherId': publisherId,
                ':bc': composeKeys(botParams.botId, conversationId),
            },
        }),
        aws.getUserByUserId(publisherId, botParams.botId, message.channel, message.senderId),
    ]);
    convQueryRes.Items.map((x, i) => reportDebug(`ai: convQueryRes ${i}`, x));

    if (convQueryRes.Count === 0) {
        throw new Error('ai: couldn\'t find the conversation');
    }

    const witData = Object.assign({
        sessionId: uuid.v4(),
        context: {},
    }, convQueryRes.Items[0].witData);
    reportDebug('ai: witData: ', witData);


    const userPrefs = user && user.prefs || {};
    reportDebug('ai user preferences: ', userPrefs);


    let text = message.text;
    if (message.cards && message.cards.length) {
        text = `${text || ''} ${_.last(message.cards).imageUrl}`
    }
    if (!text) {
        return;
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
}

export default ai;

