/* @flow */

import * as aws from '../lib/aws.js';
import type { DBMessage, ResponseMessage } from '../lib/types.js';
import { ENV, catchPromise, callbackToPromise, request } from '../lib/util.js';
import detectImageLabels from './image-label-detection.js';
import findSimilarImages from './similar-image-search.js';
import { Wit, log as witLog } from 'node-wit';
import gm from 'gm';
import _ from 'lodash';
import URL from 'url';

const { WIT_ACCESS_TOKEN, DB_TABLE_CONVERSATIONS } = ENV;

export const _firstEntityValue = (entities: any, entity: any) => {
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};

export function _mkClient(respondFn: (m: ResponseMessage) => void) {
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
                if (!_firstEntityValue(entities, 'location')){
                    return { missingLocation: true };
                } else {
                    return { forecast: 'rainy as always' };
                }
                // context.forecast = 'rainy as always';
                // return context;
                // return {forecast: 'rainy as always'};
            },

            gotAttachment: async function({sessionId, context, text, entities}) {
                console.log('actions.gotAttachments...');
                console.log(`Session ${sessionId} received ${text}`);
                console.log(`The current context is ${JSON.stringify(context)}`);
                console.log(`Wit extracted ${JSON.stringify(entities)}`);

                const url = _firstEntityValue(entities, 'url');
                if (!url) {
                    console.log('ERROR: url missing');
                    return context;
                }

                const reqRes = await request({
                    url: URL.parse(url),
                    encoding: null,
                })

                if (!reqRes || reqRes.statusCode !== 200 || !(reqRes.body instanceof Buffer)) {
                    console.error(`ERROR: coudn't download url: `, url);
                    return {};
                }

                const gmStream = gm(reqRes.body).resize(800, 800, '>');
                const smallImage = await callbackToPromise(gmStream.toBuffer, gmStream)('jpg');
                const imageLabels = await detectImageLabels(smallImage);

                const labelsStr = imageLabels.map(x => x.label).join(', ');

                return {
                    imageAttachment: url,
                    imageLabels: labelsStr
                }

            },

            findSimilarImages: async function({sessionId, context, text, entities}) {
                console.log('actions.findSimilarImages...');
                console.log(`Session ${sessionId} received ${text}`);
                console.log(`The current context is ${JSON.stringify(context)}`);
                console.log(`Wit extracted ${JSON.stringify(entities)}`);

                if (!context.imageAttachment) {
                    console.error('ERROR: no imageAttachment')
                }

                let similarImagesResponse = await findSimilarImages(context.imageAttachment);
                if (!similarImagesResponse.successful) {
                    respondFn('Unfortunately there was an error while trying to find similar images.');
                    return {};
                }
                if (similarImagesResponse.fake) {
                    respondFn('(these results are fake, just for development purposes)');
                }

                const similarImages = similarImagesResponse.results;

                respondFn({
                    files: similarImages,
                });
                return {};
            },
        },
        logger: new witLog.Logger(witLog.DEBUG)
    });
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
    const client = _mkClient(respondFn);
    const newContext = await client.runActions(conversationId, text, context);

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
