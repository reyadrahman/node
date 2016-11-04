/* @flow */

import _ from 'lodash';
import type { ClientConstants } from '../misc/types.js';
import { createUrlQuery } from '../misc/utils.js';
import * as E from '../misc/error-codes.js';

export function isFullscreen() {
    return Boolean(document && (
                   document.fullscreenElement ||
                   document.mozFullScreenElement ||
                   document.webkitFullscreenElement ||
                   // $FlowFixMe
                   document.msFullscreenElement));
}

export function requestFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        // $FlowFixMe
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}

export function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
}

export const CONSTANTS_KEYS = [
    'NODE_ENV',
    'PLATFORM',
    'AWS_REGION',
    'S3_BUCKET_NAME',
    'IDENTITY_POOL_ID',
    'IDENTITY_POOL_UNAUTH_ROLE_ARN',
    'IDENTITY_POOL_AUTH_ROLE_ARN',
    'USER_POOL_ID',
    'USER_POOL_APP_CLIENT_ID',
    'PUBLIC_PATH',
    'PUBLIC_URL',
    'DEBUG',
    'OWN_BASE_URL'
];

export const CONSTANTS: ClientConstants = _.pick(process.env, CONSTANTS_KEYS);

/*
    POST request with json body, return raw response
*/
// export async function fetchjp(url: string, json: Object): Promise<*> {
//     const res = await fetch(url, {
//         method: 'POST',
//         headers: new Headers({
//             'Content-Type': 'application/json',
//         }),
//         body: JSON.stringify(json),
//     });
//     if (res.ok) {
//         return res;
//     }
//     throw { code: E.GENERAL_ERROR };
// }

/*
    fetch POST request with json body and then parse response as json
*/
export async function fetchjp2j(url: string, json: Object): Promise<*> {
    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(json),
    });
    let resJson;
    try {
        resJson = await res.json();
    } catch(error) {}

    if (res.ok) {
        return resJson
    }
    throw resJson || { code: E.GENERAL_ERROR };
}

/*
    fetch GET request and then parse response as json
*/
export async function fetchg2j(url: string, queryParams: {[key: string]: any}): Promise<*> {
    const urlWithQueries = `${url}?` + createUrlQuery(queryParams);
    const res = await fetch(urlWithQueries);
    let resJson;
    try {
        resJson = await res.json();
    } catch(error) {}

    if (res.ok) {
        return resJson
    }
    throw resJson || { code: E.GENERAL_ERROR };
}
