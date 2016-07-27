/* @flow */

import request_ from 'request';


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

// export function memoize0(f: Function) {
//     let result;
//     return function() {
//         if (!result) {
//             result = f.call(this, arguments);
//         }
//         return result;
//     }
// }

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


export type TENV = {
    NODE_ENV: string,
    AWS_REGION: string,
    AWS_ACCESS_KEY_ID: string,
    AWS_SECRET_ACCESS_KEY: string,
    DB_TABLE_BOTS: string,
    DB_TABLE_CONVERSATIONS: string,
    DB_TABLE_MESSAGES: string,
    DB_TABLE_AI_ACTIONS: string,
    S3_BUCKET_NAME: string,
    AI_ACTIONS_SERVER: string,
    GOOGLE_CLOUD_VISION_API_KEY: string,
    MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY: string,
};

export const ENV: TENV = process.env;

export const CONSTANTS = {
    AI_ACTION_CACHE_VALID_TIME_S: 10,
    TYPING_INDICATOR_DELAY_S: 2,
};
