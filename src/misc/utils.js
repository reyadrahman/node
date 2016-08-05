/* @flow */

import request_ from 'request';
import _ from 'lodash';
import type { ServerEnv, ClientEnv } from './types.js';

function customEncodeURIComponent(comp) {
    // return encodeURIComponent(comp).replace(/\./g, '%2E').replace(/%20/g, '.');
    return encodeURIComponent(comp);
}

function customDecodeURIComponent(comp) {
    // return decodeURIComponent(comp.replace(/\./g, '%20'));
    return decodeURIComponent(comp);
}

export function searchQueryToPath(query: { searchPhrase: string, filterPhotographer: string }) {
    const comps = ['search', query.searchPhrase, query.filterPhotographer];
    const path = comps.filter(x => x).map(customEncodeURIComponent).join('/');
    return `/${path}`;
}

export function pathToSearchQuery(path: string) {
    if (!path) return null;
    const split = path.split('/').filter(x => x);
    if (split.length < 1) return null;
    return {
        searchPhrase: customDecodeURIComponent(split[0] || ''),
        filterPhotographer: customDecodeURIComponent(split[1] || ''),
    };
}

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

export function callbackToPromise(f: Function, context?: Object) {
    return function() {
        return new Promise((resolve, reject) => {
            f.apply(context, Array.prototype.slice.apply(arguments).concat(
                (err, res) => err ? reject(err) : resolve(res)))
        });
    };
}

export const request = callbackToPromise(request_);

export function timeout(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

// Needed for mocha
export function arity(length: number, fn: Function) {
    switch (length) {
        case 0 : return function () {
            return fn.apply(this, arguments);
        };
        case 1 : return function (a:any) {
            return fn.apply(this, arguments);
        };
        case 2 : return function (a:any, b:any) {
            return fn.apply(this, arguments);
        };
        case 3 : return function (a:any, b:any, c:any) {
            return fn.apply(this, arguments);
        };
        case 4 : return function (a:any, b:any, c:any, d:any) {
            return fn.apply(this, arguments);
        };
        case 5 : return function (a:any, b:any, c:any, d:any, e:any) {
            return fn.apply(this, arguments);
        };
        default : return function (a:any, b:any, c:any, d:any, e:any, f:any) {
            return fn.apply(this, arguments);
        };
    }
};

export function catchPromise(fn: Function) {
    return arity(fn.length, async function() {
        try {
            return await fn.apply(this, arguments);
        } catch(error) {
            console.error(error);
            throw error;
        }
    });
}

export function allEntityValues(entities: any, entity: any) {
    if (!entities || !entities[entity] || !Array.isArray(entities[entity])) {
        return [];
    }
    const es = entities[entity];
    return es.map(x => typeof x.value === 'object' ? x.value.value : x.value);
};



// process.env is different on the server and client.
// process.env on the client is injected by the server (see server/*.js).
// The server gets to pick what environment variables the client must have.
export const SERVER_ENV: ServerEnv = process.env;
export const CLIENT_ENV: ClientEnv = _.pick(process.env, [
    'NODE_ENV',
    'PLATFORM',
    'AWS_REGION',
    'DB_TABLE_BOTS',
    'DB_TABLE_CONVERSATIONS',
    'DB_TABLE_MESSAGES',
    'DB_TABLE_AI_ACTIONS',
    'S3_BUCKET_NAME',
    'PUBLIC_PATH',
    'PUBLIC_URL',
    'DEBUG',
]);

export const CONSTANTS = {
    AI_ACTION_CACHE_VALID_TIME_S: 10,
    TYPING_INDICATOR_DELAY_S: 2,
};
