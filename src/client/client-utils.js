/* @flow */

import _ from 'lodash';
import type { ClientEnv } from '../misc/types.js';
import { createUrlQuery } from '../misc/utils.js';

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

export const ENV: ClientEnv = _.pick(process.env, [
    'NODE_ENV',
    'PLATFORM',
    'AWS_REGION',
    'DB_TABLE_BOTS',
    'DB_TABLE_CONVERSATIONS',
    'DB_TABLE_MESSAGES',
    'DB_TABLE_AI_ACTIONS',
    'DB_TABLE_USER_PREFS',
    'S3_BUCKET_NAME',
    'IDENTITY_POOL_ID',
    'IDENTITY_POOL_UNAUTH_ROLE_ARN',
    'IDENTITY_POOL_AUTH_ROLE_ARN',
    'USER_POOL_ID',
    'USER_POOL_APP_CLIENT_ID',
    'PUBLIC_PATH',
    'PUBLIC_URL',
    'DEBUG',
]);

/*
    POST request with json body, return raw response
*/
export async function fetchjp(url: string, json: Object): Promise<*> {
    const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(json),
    });
    if (res.ok) {
        return res;
    }
    throw new Error(`fetching ${url} failed`);
}

/*
    fetch POST request with json body and then parse response as json
*/
export async function fetchjp2j(url: string, json: Object): Promise<*> {
    const res = await fetchjp(url, json);
    return await res.json();
}

/*
    fetch GET request with and then parse response as json
*/
export async function fetchg2j(url: string, queryParams: {[key: string]: any}): Promise<*> {
    const urlWithQueries = `${url}?` + createUrlQuery(queryParams);
    const res = await fetch(urlWithQueries);
    if (res.ok) {
        return await res.json();
    }
    throw new Error(`fetching ${url} failed`);
}
