/* @flow */


import { request, ENV } from '../lib/util.js';
import gVision from 'node-cloud-vision-api';
import flatten from 'lodash/flatten';
import uniqBy from 'lodash/uniqBy';

const MS_LABEL_CONFIDENCE_THRESHOLD = 0.6;
const G_LABEL_CONFIDENCE_THRESHOLD = 0.7;

const { GOOGLE_CLOUD_VISION_API_KEY, MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY } = ENV;

gVision.init({auth: GOOGLE_CLOUD_VISION_API_KEY});

export default function(imageBuffer: Buffer) {
    const sources = [fromGoogle(imageBuffer), fromMicrosoft(imageBuffer)];
    return Promise.all(sources).then(combineLabelSources);
}

function fromGoogle(imageBuffer) {
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

function fromMicrosoft(imageBuffer) {
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

function combineLabelSources(sources) {
    let labelsDup = flatten(sources)
        .sort((a, b) => b.confidence - a.confidence);
    return uniqBy(labelsDup, x => x.label);
}
