/* @flow */

import * as aws from '../../aws/aws.js';
import type { DBMessage, ResponseMessage, BotParams, ActionRequest,
              ActionResponse, UserPrefs } from '../../misc/types.js';
import { ENV, request, allEntityValues } from '../server-utils.js';
import { toStr, catchPromise, callbackToPromise } from '../../misc/utils.js';
import { Wit, log as witLog } from 'node-wit';
import _ from 'lodash';
import URL from 'url';
import uuid from 'node-uuid';

const { DB_TABLE_CONVERSATIONS, DB_TABLE_USER_PREFS, S3_BUCKET_NAME } = ENV;

type WitData = {
    context: Object,
    sessionId: string,
    lastActionPrefix?: string,
};

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

export function _mkClient(accessToken: string, respondFn: (m: ResponseMessage) => void) {
    return new Wit({
        accessToken,
        respondFn,
        actions: {
            send: async function(request: ActionRequestIncomplete, response) {
                console.log('actions.send: ', JSON.stringify(response));
                respondFn({
                    text: response.text,
                    actions: response.actions,
                });
            },
            merge: async function({entities, context, message, sessionId}) {
                console.log('actions.merge...');
                console.log('entities: ', entities);
                console.log('context: ', context);
                console.log('message: ', message);
                console.log('sessionId: ', sessionId);
                return context;
            },
        },
        logger: new witLog.Logger(witLog.DEBUG)
    });
}

export async function _runActions(client: Wit,
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
    return await _runActionsHelper(client, text, originalMessage, witData,
                                   userPrefs, botParams, converseData, 5);
}

export async function _runActionsHelper(client: Wit,
                                        text: string,
                                        originalMessage: DBMessage,
                                        witData: WitData,
                                        userPrefs: UserPrefs,
                                        botParams: BotParams,
                                        converseData: Object,
                                        level: number
) : Promise<RunActionsRes>
{
    console.log('_runActionsHelper: converseData: ', converseData);
    if (level < 0) {
        console.log('_runActionsHelper: Max steps reached, stopping.');
        return { userPrefs, witData };
    }

    if (!converseData.type) {
        throw new Error(`Couldn't find type in Wit response`);
    }

    console.log('witData: ', witData);
    console.log('Response type: ', converseData.type);

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
        const qrs = converseData.quickreplies;
        const response = {
            text: converseData.msg,
            actions:  qrs && qrs.map(
                x => ({ text: x, fallback: x })
            ),
        };
        const invalidContext = await client.config.actions.send(requestData, response);
        if (invalidContext) {
            throw new Error('Cannot update context after \'send\' action');
        }
        const newConverseData = await client.converse(witData.sessionId, null, {
            ...witData.context,
            userPrefs,
        });
        return await _runActionsHelper(client, text, originalMessage, witData,
                                       userPrefs, botParams, newConverseData, level-1)

    } else if (converseData.type === 'action') {
        let actionFullName = converseData.action;
        let newWitData = witData;
        let newRequestData = requestData;
        const sepIndex = actionFullName.indexOf('_');
        const prefix = sepIndex > 0 ? actionFullName.split('_')[0] : '';
        const action = sepIndex > 0 ? actionFullName.substr(sepIndex+1) : actionFullName;
        console.log(`prefix: ${prefix}`);
        console.log(`action: ${action}`);
        if (prefix !== witData.lastActionPrefix && (prefix || witData.lastActionPrefix)) {
            console.log(`Story changed from "${witData.lastActionPrefix || 'N/A'}" to "${prefix}"`);
            console.log(`Resetting context...`);
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
            await _runAction(action, newRequestData, originalMessage, botParams,
                             client.config.actions) || {};
        console.log('action returned: ', actionRes);
        newWitData.context = actionRes.context || {};
        const newUserPrefs = _.has(actionRes, 'userPrefs')
            ? actionRes.userPrefs || {}
            : userPrefs;

        if (actionRes.msg) {
            client.config.respondFn(actionRes.msg);
        }
        const newConverseData = await client.converse(newWitData.sessionId, null, {
            ...newWitData.context,
            userPrefs,
        });
        return await _runActionsHelper(client, text, originalMessage, newWitData,
                                       newUserPrefs, botParams, newConverseData,
                                       level-1)
    } else {
        console.error('unknown response type', converseData);
        throw new Error(`unknown response type ${converseData.type}`);
    }
}

export async function _runAction(actionName: string,
                                 actionRequest: ActionRequestIncomplete,
                                 originalMessage: DBMessage,
                                 botParams: BotParams,
                                 localActions: {[key: string]: Function})
{
    console.log('_runAction: ')
    console.log('\t actionName: ', actionName);
    console.log('\t actionRequest: ', actionRequest);
    const { publisherId } = botParams;
    const { senderId } = originalMessage;
    if (!senderId) {
        throw new Error(`ERROR: _runAction senderId: ${senderId || ''}`);
    }
    const federationToken = await aws.stsGetFederationToken({
        Name: uuid.v1().substr(0, 30),
        DurationSeconds: 15 * 60,
        Policy: _generateS3Policy(publisherId, senderId),
    });
    const credentials = federationToken.Credentials;
    console.log('got federationToken: ', federationToken);
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
            bucket: S3_BUCKET_NAME,
            prefix: `${publisherId}/${senderId}/`,
        }
    }
    if (localActions[actionName]) {
        return await localActions[actionName](requestData);
    }

    const action = await aws.getAIAction(actionName);
    console.log('_runAction: ', action);
    if (action.url) {
        const res = await request({
            uri: action.url,
            method: 'POST',
            json: true,
            body: requestData,
        });

        if (res.statusCode === 200) {
            console.log('_runAction url, returned: ', res.body);
            return res.body;
        } else {
            throw new Error(`_runAction url, returned error code ${res.statusCode}`
                          + ` and body: ${JSON.stringify(res.body)}`);
        }
    }
    else if (action.lambda){
        const { lambda } = action;
        const res = await aws.lambdaInvoke({
            FunctionName: lambda,
            Payload: JSON.stringify(requestData),
        });
        console.log('lambda returned: ', res);
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

export function _generateS3Policy(publisherId: string, senderId: string): string {
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
                    `arn:aws:s3:::${S3_BUCKET_NAME}/${publisherId}/${senderId}/*`,
                ]
            }
        ]
    });
}

export async function ai(message: DBMessage,
                         botParams: BotParams,
                         respondFn: (m: ResponseMessage) => void)
{
    if (!botParams.settings.witAccessToken) {
        throw new Error(`Bot doesn't have witAccessToken: ${toStr(botParams)}`);
    }

    const [publisherId, conversationId] = aws.decomposeKeys(message.publisherId_conversationId);


    // TODO batch queries
    const convQueryRes = await aws.dynamoQuery({
        TableName: DB_TABLE_CONVERSATIONS,
        KeyConditionExpression: 'publisherId = :publisherId and conversationId = :conversationId',
        ExpressionAttributeValues: {
            ':publisherId': publisherId,
            ':conversationId': conversationId,
        },
    });
    convQueryRes.Items.map((x, i) => console.log(`ai: convQueryRes ${i}`, x));

    if (convQueryRes.Count === 0) {
        throw new Error('ai: couldn\'t find the conversation');
    }

    const witData = Object.assign({
        sessionId: uuid.v1(),
        context: {},
    }, convQueryRes.Items[0].witData);
    console.log('ai: witData: ', witData);


    // TODO batch queries
    const prefQueryRes = await aws.dynamoQuery({
        TableName: DB_TABLE_USER_PREFS,
        KeyConditionExpression: 'publisherId = :publisherId and botId_userId = :bu',
        ExpressionAttributeValues: {
            ':publisherId': publisherId,
            ':bu': aws.composeKeys(botParams.botId, message.senderId),
        },
    });
    console.log('ai: user preferences found: ', prefQueryRes.Items);
    const userPrefs = prefQueryRes.Items && prefQueryRes.Items[0] &&
                      prefQueryRes.Items[0].prefs || {};


    let text = message.text;
    if (message.cards && message.cards.length) {
        text = `${text || ''} ${_.last(message.cards).imageUrl}`
    }
    if (!text) {
        return;
    }


    const client = _mkClient(botParams.settings.witAccessToken, respondFn);
    const { witData: newWitData, userPrefs: newUserPrefs } =
        await _runActions(client, text, message, witData, userPrefs, botParams);

    // TODO batch dynamo queries
    await aws.dynamoUpdate({
        TableName: DB_TABLE_CONVERSATIONS,
        Key: {
            publisherId,
            conversationId,
        },
        UpdateExpression: 'SET witData = :witData',
        ExpressionAttributeValues: {
            ':witData': aws.dynamoCleanUpObj(newWitData),
        },
    });
    await aws.dynamoPut({
        TableName: DB_TABLE_USER_PREFS,
        Item: aws.dynamoCleanUpObj({
            publisherId,
            botId_userId: aws.composeKeys(botParams.botId, message.senderId),
            prefs: newUserPrefs,
        }),
    });
}

export default ai;
