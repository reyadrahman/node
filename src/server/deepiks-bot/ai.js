/* @flow */

import * as aws from '../../aws/aws.js';
import type { DBMessage, ResponseMessage, BotParams } from '../../misc/types.js';
import { SERVER_ENV, catchPromise, callbackToPromise, request,
         allEntityValues } from '../../misc/utils.js';
import type { ActionRequest, ActionResponse } from '../../misc/types.js';
import gotAttachment from './got-attachment-action.js';
import { Wit, log as witLog } from 'node-wit';
import _ from 'lodash';
import URL from 'url';
import uuid from 'node-uuid';

const { DB_TABLE_CONVERSATIONS } = SERVER_ENV;

type WitData = {
    context: Object,
    sessionId: string,
    lastActionPrefix?: string,
};

export function _mkClient(accessToken: string, respondFn: (m: ResponseMessage) => void) {
    return new Wit({
        accessToken,
        respondFn,
        actions: {
            send: async function(request, response) {
                console.log('actions.send: ', JSON.stringify(response));
                respondFn({
                    text: response.text,
                    quickReplies: response.quickReplies,
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
            gotAttachment,
        },
        logger: new witLog.Logger(witLog.DEBUG)
    });
}

export async function _runActions(client: Wit, text: string, witData: WitData,
                                  botParams: BotParams)
                                  : Promise<WitData>
{
    let converseData = await client.converse(witData.sessionId, text, witData.context);
    return await _runActionsHelper(client, text, witData,
                                   botParams, converseData, 5);
}

export async function _runActionsHelper(client: Wit,
                                        text: string,
                                        witData: WitData,
                                        botParams: BotParams,
                                        converseData: Object,
                                        level: number)
                                        : Promise<WitData>
{
    console.log('_runActionsHelper: converseData: ', converseData);
    if (level < 0) {
        console.log('_runActionsHelper: Max steps reached, stopping.');
        return witData;
    }

    if (!converseData.type) {
        throw new Error('Couldn\'t find type in Wit response');
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
        return witData;
    }

    const requestData = {
        sessionId: witData.sessionId,
        context: witData.context,
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
        const newConverseData = await client.converse(witData.sessionId, null, witData.context);
        return await _runActionsHelper(client, text, witData,
                                       botParams, newConverseData, level-1)

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
            await _runAction(action, newRequestData, client.config.actions) || {};
        console.log('action returned: ', actionRes);
        newWitData.context = actionRes.context || {};

        if (actionRes.msg) {
            client.config.respondFn(actionRes.msg);
        }
        const newConverseData = await client.converse(newWitData.sessionId, null, newWitData.context);
        return await _runActionsHelper(client, text, newWitData,
                                       botParams, newConverseData, level-1)
    } else {
        console.error('unknown response type', converseData);
        throw new Error('unknown response type ' + converseData.type);
    }
}

export async function _runAction(actionName: string, actionRequest: ActionRequest,
                                 localActions: {[key: string]: Function})
{
    console.log('_runAction: ')
    console.log('\t actionName: ', actionName);
    console.log('\t actionRequest: ', actionRequest);
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
    qres.Items.map((x, i) => console.log(`ai: qres ${i}`, x));

    if (qres.Count === 0) {
        throw new Error('ai: couldn\'t find the conversation');
    }

    const witData = Object.assign({
        sessionId: uuid.v1(),
        context: {},
    }, qres.Items[0].witData);
    console.log('ai: witData: ', witData);

    let text = message.text;
    if (message.files && message.files.length) {
        text = `${text || ''} ${_.last(message.files)}`
    }
    if (!text) {
        return;
    }


    const client = _mkClient(botParams.settings.witAccessToken, respondFn);
    const newWitData = await _runActions(client, text, witData, botParams);

    await aws.dynamoPut({
        TableName: DB_TABLE_CONVERSATIONS,
        Item: aws.dynamoCleanUpObj({
            publisherId,
            conversationId,
            witData: newWitData,
        }),
    });
}

export default ai;