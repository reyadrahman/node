/* @flow */

import { request, allEntityValues, ENV } from '../lib/util.js';
import type { ActionRequest, ActionResponse, ActionResponseMessage } from '../lib/types.js';
import URL from 'url';

const { FAKE_SIMILAR_IMAGES } = ENV;

export default async function findSimilarImages(req: ActionRequest): ActionResponse {
    const { sessionId, context, text, entities } = req;
    console.log('actions.findSimilarImages...');
    console.log(`Session ${sessionId} received ${text}`);
    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);

    if (!context.imageAttachment) {
        console.error('ERROR: no imageAttachment')
        return { context };
    }

    let similarImagesResponse = await _findSimilarImagesHelper(context.imageAttachment);
    if (!similarImagesResponse.successful) {
        return {
            msg: 'Unfortunately there was an error while trying to find similar images.',
            context: {},
        }
    }

    const similarImages = similarImagesResponse.results;

    const msg: ActionResponseMessage = {
        files: similarImages,
    };
    if (similarImagesResponse.fake) {
        msg.text = '(these results are fake, just for development purposes)';
    }
    return { msg, context: {} };
};

export async function _findSimilarImagesHelper(url: string) {
    if (Number(FAKE_SIMILAR_IMAGES) === 1) {
        return {
            fake: true,
            successful: true,
            results: [
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-17177.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-02999.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-10367.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-12985.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-07015.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-24742.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-02553.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-21616.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-00137.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-01399.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-12978.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-19303.jpg'
            ]
        };
    }

    let r;
    try {
        r = await request({
            url: URL.parse(`http://52.205.71.12:9000/s3files?img=${url}`)
        });
    } catch (err) {
        console.error(err);
    }
    if (!r || r.statusCode !== 200) {
        return {
            fake: false,
            results: [],
            successful: false,
        }
    }

    return {
        fake: false,
        successful: true,
        results: JSON.parse(r.body).results,
    };
}
