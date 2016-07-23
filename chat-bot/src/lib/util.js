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

// export function memoize0(f: Function) {
//     let result;
//     return function() {
//         if (!result) {
//             result = f.call(this, arguments);
//         }
//         return result;
//     }
// }

export type TENV = {
    NODE_ENV: string,
    AWS_REGION: string,
    AWS_ACCESS_KEY_ID: string,
    AWS_SECRET_ACCESS_KEY: string,
    DB_TABLE_BOTS: string,
    DB_TABLE_CONVERSATIONS: string,
    DB_TABLE_WIT_SESSIONS: string,
    S3_BUCKET_NAME: string,
    GOOGLE_CLOUD_VISION_API_KEY: string,
    MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY: string,
    FAKE_SIMILAR_IMAGES: string,
    WIT_ACCESS_TOKEN: string,
};

export const ENV: TENV = process.env;
