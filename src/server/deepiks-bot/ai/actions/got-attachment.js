/* @flow */

import type { AIActionRequest } from '../../../misc/types.js';
const reportDebug = require('debug')('deepiks:got-attachment');
const reportError = require('debug')('deepiks:got-attachment:error');

export default async function gotAttachment(actionRequest: AIActionRequest) {
    reportDebug('actionRequest: ', actionRequest);
    const entityUrls = allEntityValues(actionRequest.entities, 'url');
    let selectedUrl = entityUrls.find(destructureS3Url);
    if (selectedUrl) {
        const ret = {
            context: {
                imageAttachment: selectedUrl,
            }
        };
        reportDebug('returning: ', ret);
        return ret;
    } else {
        return {
            context: { }
        };
    }
}

function allEntityValues(entities, entity) {
    if (!entities || !entities[entity] || !Array.isArray(entities[entity])) {
        return [];
    }
    const es = entities[entity];
    return es.map(x => typeof x.value === 'object' ? x.value.value : x.value);
}

function destructureS3Url(url) {
    // examples
    // https://s3.amazonaws.com/BUCKET/KEY
    // https://BUCKET.s3-eu-west-1.amazonaws.com/KEY
    // https://BUCKET.s3.amazonaws.com/KEY
    let res = url.match(/https:\/\/s3\.amazonaws\.com\/(.+?)\/(.+)/i) ||
        url.match(/https:\/\/(.+?)\.s3.*?\.amazonaws\.com\/(.+)/i);
    if (!res) return null;
    return { bucket: decodeURIComponent(res[1]), key: decodeURIComponent(res[2]) };
}

