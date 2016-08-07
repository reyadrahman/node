/* @flow */

import { callbackToPromise } from '../misc/utils.js';
import type { ServerEnv } from '../misc/types.js';
import request_ from 'request';

export const request = callbackToPromise(request_);

// TODO remove this
export function allEntityValues(entities: any, entity: any) {
    if (!entities || !entities[entity] || !Array.isArray(entities[entity])) {
        return [];
    }
    const es = entities[entity];
    return es.map(x => typeof x.value === 'object' ? x.value.value : x.value);
};

export const CONSTANTS = {
    AI_ACTION_CACHE_VALID_TIME_S: 10,
    TYPING_INDICATOR_DELAY_S: 2,
};

// process.env is different on the server and client.
// process.env on the client is injected by the server (see server/*.js).
// The server gets to pick what environment variables the client must have.
export const ENV: ServerEnv = process.env;
