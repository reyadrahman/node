/* @flow */

import * as aws from '../lib/aws.js';
import type { DBMessage, ResponseMessage } from '../lib/types.js';
import { ENV, catchPromise, callbackToPromise, request } from '../lib/util.js';
import { Wit, log as witLog } from 'node-wit';
import _ from 'lodash';
import URL from 'url';

const { WIT_ACCESS_TOKEN, DB_TABLE_CONVERSATIONS, AI_ACTIONS_SERVER } = ENV;

type ActionRequest = {
    sessionId: string,
    context: Object,
    text: string,
    entities: Object,
};

export function _mkClient(respondFn: (m: ResponseMessage) => void) {
    return new Wit({
        accessToken: WIT_ACCESS_TOKEN,
        respondFn,
        actions: {
            send: async function(request, response) {
                console.log('actions.send: ', JSON.stringify(response));
                respondFn(response.text);
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

export async function _runActions(client: Wit, sessionId: string,
                                  text: string, context: Object)
{
    let converseData = await client.converse(sessionId, text, context);
    return await _runActionsHelper(client, sessionId, text, context, converseData, 5);
}

export async function _runActionsHelper(client: Wit, sessionId: string,
                                        text: string, context: Object,
                                        converseData: Object, level: number)
{
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
    };

    if (converseData.type === 'msg') {
        const response = {
            text: converseData.msg,
            quickreplies: converseData.quickreplies,
        };
        const invalidContext = await client.config.actions.send(requestData, response);
        if (invalidContext) {
            throw new Error('Cannot update context after \'send\' action');
        }
        const newConverseData = await client.converse(sessionId, null, context);
        return await _runActionsHelper(client, sessionId, text, context,
                                       newConverseData, level-1)

    } else if (converseData.type === 'action') {
        const action = converseData.action;
        const { msg, context: newContext = {} } =
            await _runExternalFunction(action, requestData) || {};
        if (msg) {
            client.config.respondFn(msg);
        }
        const newConverseData = await client.converse(sessionId, null, newContext);
        return await _runActionsHelper(client, sessionId, text, newContext,
                                       newConverseData, level-1)
    } else {
        console.error('unknown response type', converseData);
        throw new Error('unknown response type ' + converseData.type);
    }
}

export async function _runExternalFunction(action: string, requestData: ActionRequest) {
    const res = await request({
        uri: AI_ACTIONS_SERVER,
        method: 'POST',
        json: true,
        body: {
            ...requestData,
            action,
        },
    });
    if (res.statusCode === 200) {
        console.log('_runExternalFunction returned: ', res.body);
        return res.body;
    } else {
        throw new Error('AI_ACTIONS_SERVER at ' + AI_ACTIONS_SERVER + ' returned: ', res);
    }
}

export async function ai(message: DBMessage,
                         respondFn: (m: ResponseMessage) => void)
{
    // TODO figure out when to use context and when to clear context

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
        console.error('ai: couldn\'t find the conversation');
        return;
    }

    const context = qres.Items[0].witContext || {};
    console.log('ai: got context: ', context);

    let text = message.text;
    if (message.files) {
        text = `${text || ''} ${_.last(message.files)}`
    }
    if (!text) {
        return;
    }
    const client = _mkClient(respondFn);
    const newContext = await _runActions(client, conversationId, text, context);

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
