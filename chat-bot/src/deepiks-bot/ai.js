/* @flow */

import * as aws from '../lib/aws.js';
import type { DBMessage, ResponseMessage, BotParams } from '../lib/types.js';
import { ENV, omitFalsy, catchPromise, callbackToPromise, request,
         allEntityValues } from '../lib/util.js';
import type { ActionRequest, ActionResponse } from '../lib/types.js';
import gotAttachment from './got-attachment-action.js';
import { Wit, log as witLog } from 'node-wit';
import _ from 'lodash';
import URL from 'url';

const { DB_TABLE_CONVERSATIONS, AI_ACTIONS_SERVER } = ENV;


export function _mkClient(accessToken: string, respondFn: (m: ResponseMessage) => void) {
    return new Wit({
        accessToken,
        respondFn,
        actions: {
            send: async function(request, response) {
                console.log('actions.send: ', JSON.stringify(response));
                respondFn(_.pickBy({
                    text: response.text,
                    quickReplies: response.quickReplies,
                }, x=>!!x));
            },
            merge: async function({entities, context, message, sessionId}) {
                console.log('actions.merge...');
                console.log('entities: ', entities);
                console.log('context: ', context);
                console.log('message: ', message);
                console.log('sessionId: ', sessionId);
                return context;
            },
            gotAttachment,
        },
        logger: new witLog.Logger(witLog.DEBUG)
    });
}

export async function _runActions(client: Wit, sessionId: string,
                                  text: string, context: Object,
                                  botParams: BotParams)
{
    let converseData = await client.converse(sessionId, text, context);
    return await _runActionsHelper(client, sessionId, text, context,
                                   botParams, converseData, 5);
}

export async function _runActionsHelper(client: Wit, sessionId: string,
                                        text: string, context: Object,
                                        botParams: BotParams,
                                        converseData: Object, level: number)
{
    console.log('_runActionsHelper: converseData: ', converseData);
    if (level < 0) {
        console.log('_runActionsHelper: Max steps reached, stopping.');
        return context;
    }

    if (!converseData.type) {
        throw new Error('Couldn\'t find type in Wit response');
    }

    console.log('Context: ', context);
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
        return context;
    }

    const requestData = {
        sessionId,
        context,
        text,
        entities: converseData.entities,
        publisherId: botParams.publisherId,
        botId: botParams.botId,
    };

    if (converseData.type === 'msg') {
        const response = {
            text: converseData.msg,
            quickReplies: converseData.quickreplies,
        };
        const invalidContext = await client.config.actions.send(requestData, response);
        if (invalidContext) {
            throw new Error('Cannot update context after \'send\' action');
        }
        const newConverseData = await client.converse(sessionId, null, context);
        return await _runActionsHelper(client, sessionId, text, context,
                                       botParams, newConverseData, level-1)

    } else if (converseData.type === 'action') {
        const action = converseData.action;
        const { msg, context: newContext = {} } =
            await _runAction(action, requestData, client.config.actions) || {};
        if (msg) {
            client.config.respondFn(msg);
        }
        const newConverseData = await client.converse(sessionId, null, newContext);
        return await _runActionsHelper(client, sessionId, text, newContext,
                                       botParams, newConverseData, level-1)
    } else {
        console.error('unknown response type', converseData);
        throw new Error('unknown response type ' + converseData.type);
    }
}

export async function _runAction(actionName: string, actionRequest: ActionRequest,
                                 localActions: {[key: string]: Function})
{
    const requestData = {
        ...actionRequest,
        action: actionName,
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
            throw new Error('AI_ACTIONS_SERVER at ' + AI_ACTIONS_SERVER + ' returned: ', res);
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
            throw new Error(`lambda ai action named ${lambda} did not return a context: `, resPayload);
        }
        return resPayload;
    }

    throw new Error('Unknown action: ', action);
}

export async function ai(message: DBMessage,
                         botParams: BotParams,
                         respondFn: (m: ResponseMessage) => void)
{
    // TODO figure out when to use context and when to clear context

    if (!botParams.settings.witAccessToken) {
        throw new Error(`Bot doesn't have witAccessToken: `, botParams);
    }

    const [publisherId, conversationId] = aws.decomposeKeys(message.publisherId_conversationId);


    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_CONVERSATIONS,
        KeyConditionExpression: 'publisherId = :publisherId and conversationId = :conversationId',
        ExpressionAttributeValues: {
            ':publisherId': publisherId,
            ':conversationId': conversationId,
        },
    });
    console.log('ai: qres: ', qres);

    if (qres.Count === 0) {
        throw new Error('ai: couldn\'t find the conversation');
    }

    const { context = {} } = qres.Items[0];
    console.log('ai: got context: ', context);

    let text = message.text;
    if (message.files) {
        text = `${text || ''} ${_.last(message.files)}`
    }
    if (!text) {
        return;
    }
    const client = _mkClient(botParams.settings.witAccessToken, respondFn);
    const newContext = await _runActions(client, conversationId, text, context, botParams);

    await aws.dynamoPut({
        TableName: DB_TABLE_CONVERSATIONS,
        Item: {
            publisherId,
            conversationId,
            witContext: newContext,
        },
    });
}

export default ai;
