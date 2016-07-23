/* @flow */

import * as aws from '../lib/aws.js';
import type { DBMessage, WebhookMessage, ResponseMessage } from '../lib/types.js';
import { ENV } from '../lib/util.js';
import { Wit, log as witLog } from 'node-wit';

const { WIT_ACCESS_TOKEN, DB_TABLE_CONVERSATIONS } = ENV;

const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};

function mkClient(respondFn) {
    return new Wit({
        accessToken: WIT_ACCESS_TOKEN,
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

            getForecast: async function({sessionId, context, text, entities}) {
                console.log('actions.getForecast...');
                console.log(`Session ${sessionId} received ${text}`);
                console.log(`The current context is ${JSON.stringify(context)}`);
                console.log(`Wit extracted ${JSON.stringify(entities)}`);
                if (!firstEntityValue(entities, 'location')){
                    return { missingLocation: true };
                } else {
                    return { forecast: 'rainy as always' };
                }
                // context.forecast = 'rainy as always';
                // return context;
                // return {forecast: 'rainy as always'};
            }
        },
        logger: new witLog.Logger(witLog.DEBUG)
    });
}


export default async function ai(message: WebhookMessage,
                                 respondFn: (text: string) => void)
{
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

    // ===== talk to wit
    const client = mkClient(respondFn);

    // let newContext = await client.runActions(sessionId, message.text, context);
    // TODO investigate: do we need context at all?
    let newContext = await client.runActions(conversationId, message.text, {});

    await aws.dynamoPut({
        TableName: DB_TABLE_CONVERSATIONS,
        Item: {
            publisherId,
            conversationId,
            witContext: newContext,
        },
    });
}
