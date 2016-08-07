/* @flow */

import _ from 'lodash';
import type { ClientEnv } from '../misc/types.js';

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
    'S3_BUCKET_NAME',
    'IDENTITY_POOL_ID',
    'IDENTITY_POOL_ROLE_ARN',
    'USER_POOL_ID',
    'USER_POOL_APP_CLIENT_ID',
    'PUBLIC_PATH',
    'PUBLIC_URL',
    'DEBUG',
]);
