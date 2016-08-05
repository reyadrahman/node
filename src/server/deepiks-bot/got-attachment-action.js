/* @flow */

import { SERVER_ENV, callbackToPromise, request, allEntityValues } from '../../misc/utils.js';
import type { ActionRequest, ActionResponse } from '../../misc/types.js';
import URL from 'url';
import gVision from 'node-cloud-vision-api';
import _ from 'lodash';
import gm from 'gm';

// TODO move these to util.CONSTANTS
const MS_LABEL_CONFIDENCE_THRESHOLD = 0.6;
const G_LABEL_CONFIDENCE_THRESHOLD = 0.7;

const { GOOGLE_CLOUD_VISION_API_KEY, MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY } = SERVER_ENV;

gVision.init({auth: GOOGLE_CLOUD_VISION_API_KEY});


export default async function gotAttachment(req: ActionRequest): Promise<ActionResponse> {
    const { sessionId, context, text, entities } = req;
    console.log('actions.gotAttachment...');
    console.log(`Session ${sessionId} received ${text}`);
    console.log(`The current context is ${JSON.stringify(context)}`);
    console.log(`Wit extracted ${JSON.stringify(entities)}`);

    const urls = allEntityValues(entities, 'url');
    if (urls.length === 0) {
        console.log('ERROR: url missing');
        return context;
    }

    let selectedImage;
    for (let i=0; i<urls.length && !selectedImage; i++) {
        const url = urls[i];
        try {
            const startTime = Date.now();
            const reqRes = await request({
                url: URL.parse(url),
                encoding: null,
            });
            console.log('PROFILING: s3 download time: %s ms', Date.now() - startTime);
            if (reqRes && reqRes.statusCode === 200 && reqRes.body instanceof Buffer) {
                selectedImage = { url, buffer: reqRes.body };
            }
        } catch(err){ }
    }

    if (!selectedImage) {
        console.error(`ERROR: coudn't download urls: `, urls);
        const msg = urls.length === 1
            ? `Could not download image located at "${urls[0]}"`
            : `Detected multiple urls, none of which is a valid image: ` +
                urls.map(x=>`"${x}"`).join(', ');
        return { msg, context };
    }

    const gmStream = gm(selectedImage.buffer).resize(800, 800, '>');
    const smallImage = await callbackToPromise(gmStream.toBuffer, gmStream)('jpg');
    const imageLabels = await _detectImageLabels(smallImage);

    const labelsStr = imageLabels.map(x => x.label).join(', ');

    return {
        context: {
            imageAttachment: selectedImage.url,
            imageLabels: labelsStr
        },
    };

}


function _detectImageLabels(imageBuffer: Buffer) {
    const sources = [_fromGoogle(imageBuffer), _fromMicrosoft(imageBuffer)];
    return Promise.all(sources).then(_combineLabelSources);
}

function _fromGoogle(imageBuffer) {
    const imageBase64 = imageBuffer.toString('base64');
    // console.log('base64: \n\n');
    // console.log(imageBase64);
    // console.log('\n\n');
    const req = new gVision.Request({
        image: new gVision.Image({base64: imageBase64}),
        features: [
            new gVision.Feature('LABEL_DETECTION', 30),
        ]
    })

    // send single request
    return gVision.annotate(req).then(res => {
        //console.log('google image annotate res: ', res);
        const errors = res.responses.filter(x => x.error);
        if (errors.length > 0) {
            throw new Error('Google image label detection error: ' + errors[0].error.message);
        }
        console.log(res.responses.map(x => ({labelAnnotations: JSON.stringify(x.labelAnnotations)})))

        return res.responses[0].labelAnnotations
            .map(x => ({
                label: x.description,
                confidence: x.score,
            }))
            .filter(x => x.confidence > G_LABEL_CONFIDENCE_THRESHOLD);

        // return res.responses;
    });
}

function _fromMicrosoft(imageBuffer) {
    return request({
        url: 'https://api.projectoxford.ai/vision/v1.0/tag',
        headers: {
            'Ocp-Apim-Subscription-Key': MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY,
            'Content-Type': 'application/octet-stream',
        },
        method: 'POST',
        body: imageBuffer,
    }).then(res => {
        const resObj = JSON.parse(res.body);
        console.log('res from microsoft: ', resObj);
        return resObj.tags
            .map(x => ({
                label: x.name,
                confidence: x.confidence,
            }))
            .filter(x => x.confidence > MS_LABEL_CONFIDENCE_THRESHOLD);
    })
}

function _combineLabelSources(sources) {
    let labelsDup = _.flatten(sources)
        .sort((a, b) => b.confidence - a.confidence);
    return _.uniqBy(labelsDup, x => x.label);
}
