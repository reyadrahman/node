/* @flow */

import * as aws from '../lib/aws.js';
import type { DBMessage, ResponseMessage } from '../lib/types.js';
import { ENV, catchPromise, callbackToPromise, request } from '../lib/util.js';
import detectImageLabels from './image-label-detection.js';
import findSimilarImages from './similar-image-search.js';
import applyEffect from './image-effects.js';
import { Wit, log as witLog } from 'node-wit';
import gm from 'gm';
import _ from 'lodash';
import URL from 'url';

const { WIT_ACCESS_TOKEN, DB_TABLE_CONVERSATIONS } = ENV;

export function _allEntityValues(entities: any, entity: any) {
    if (!entities || !entities[entity] || !Array.isArray(entities[entity])) {
        return [];
    }
    const es = entities[entity];
    return es.map(x => typeof x.value === 'object' ? x.value.value : x.value);
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
                const entityValues = _allEntityValues(entities, 'location');
                if (entityValues.length === 0) {
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

                const urls = _allEntityValues(entities, 'url');
                if (urls.length === 0) {
                    console.log('ERROR: url missing');
                    return context;
                }

                let selectedImage;
                for (let i=0; i<urls.length && !selectedImage; i++) {
                    const url = urls[i];
                    try {
                        const reqRes = await request({
                            url: URL.parse(url),
                            encoding: null,
                        });
                        if (reqRes && reqRes.statusCode === 200 && reqRes.body instanceof Buffer) {
                            selectedImage = { url, buffer: reqRes.body };
                        }
                    } catch(err){ }
                }

                if (!selectedImage) {
                    console.error(`ERROR: coudn't download urls: `, urls);
                    if (urls.length === 1) {
                        respondFn(`Could not download image located at "${urls[0]}"`);
                    } else {
                        respondFn(`Detected multiple urls, none of which is a valid image: ` +
                                  urls.map(x=>`"${x}"`).join(', '));
                    }
                    return context;
                }

                const gmStream = gm(selectedImage.buffer).resize(800, 800, '>');
                const smallImage = await callbackToPromise(gmStream.toBuffer, gmStream)('jpg');
                const imageLabels = await detectImageLabels(smallImage);

                const labelsStr = imageLabels.map(x => x.label).join(', ');

                return {
                    imageAttachment: selectedImage.url,
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
                    return context;
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

            applyEffect: async function({sessionId, context, text, entities}) {
                console.log('actions.applyEffect...');
                console.log(`Session ${sessionId} received ${text}`);
                console.log(`The current context is ${JSON.stringify(context)}`);
                console.log(`Wit extracted ${JSON.stringify(entities)}`);

                if (!context.imageAttachment) {
                    console.error('ERROR: no imageAttachment')
                    return context;
                }

                let newImage;
                try {
                    newImage = await applyEffect(context.imageAttachment);
                } catch(err) {
                    respondFn('Sorry, I was unable to apply the effect.');
                    return context;
                }
                respondFn({
                    files: [newImage],
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
