/* @flow */

import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import uuid from 'node-uuid';
const reportDebug = require('debug')('deepiks:utils');
const reportError = require('debug')('deepiks:utils:error');


export function stripMarkdown(text: string): string {
    return text
        .replace(/^>\s*/gm, '')
        .replace(/\*\*/g, '')
        .replace(/\n\n/g, '\n');
}

export function splitTextAtWord(text: string, chunkSize: number) {
    if (text && text.length > chunkSize) {
        const split = text.split(' ');
        return split.reduce((acc, x) => {
            const last = acc[acc.length-1];
            console.log('last: ', last, ', acc: ', acc);
            if (x.length > chunkSize) {
                pushMany(acc, splitText(x, chunkSize));
            } else if (!last || last.length + x.length + 1 > chunkSize) {
                acc.push(x);
            } else {
                acc[acc.length-1] += ' ' + x;
            }
            return acc;
        }, []);
    }
    return text ? [text] : [];
}

export function splitText(text: string, chunkSize: number) {
    if (text.length <= chunkSize) return text ? [text] : [];
    return [
        text.substr(0, chunkSize),
        ...splitText(text.substr(chunkSize), chunkSize),
    ];
}

export function isValidEmail(x: string) {
    return Boolean(x.match(/^([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)$/));
}

export function composeKeys(...xs: Array<string | number>): string {
    return xs.join('__');
}

export function decomposeKeys(k: string): string[] {
    return k.split('__');
}

// 64 bit random number in hex format
export function shortLowerCaseRandomId() {
    return uuid.v4(null, new Buffer(16)).slice(0,8).toString('hex');
}

export function toStr(obj: any): string {
    return JSON.stringify(obj, null, ' ');
}

/**
 * splitOmitWhitespace(' , a ,, ', ',') will return ['a']
 * @return {[type]} [description]
 */
export function splitOmitWhitespace(str: string, sep: string): string[] {
    return str.split(sep).map(x => x.trim()).filter(Boolean);
}

/**
 * see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
 * for why we need this and the limits of Function.prototyp.apply
 */
export function pushMany<T>(arr: T[], newElems: T[]): T[] {
    const CHUNK_LENGTH = 32768;
    const n = newElems.length;
    for (let i = 0; i < n; i += CHUNK_LENGTH) {
        arr.push(...newElems.slice(i, Math.min(i+CHUNK_LENGTH, n)));
    }

    return arr;
}

export function leftPad(x: string | number, pad: string, n: number): string {
    const str = String(x);
    return pad.repeat(Math.max(0, n - str.length)) + str;
}

export function simpleTimeFormat(timeRaw: Date | number | string) {
    const time = new Date(timeRaw);
    const within24H = time.getTime() > Date.now() - 1000 * 60 * 60 * 24;
    if (within24H) {
        const h = leftPad(time.getHours(), '0', 2);
        const m = leftPad(time.getMinutes(), '0', 2);
        return `${h}:${m}`;
    }
    // TODO translation
    var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${leftPad(time.getDate(), '0', 2)} ${monthNames[time.getMonth()]}`;
}

/**
 * Converts key-value map into query string.
 * Omits keys with undefined values.
 *
 * @param {object.<string, any>} obj
 * @returns {string}
 */
export function createUrlQuery(obj: {[key: string]: any}): string {
    const euc = encodeURIComponent;
    return map(omitBy(obj, (value, key) => isUndefined(value)), (v, k) => `${euc(k)}=${euc(v)}`)
           .join('&');
}

export function destructureS3Url(url: string): ?{ bucket: string, key: string} {
    // examples
    // https://s3.amazonaws.com/BUCKET/KEY
    // https://BUCKET.s3-eu-west-1.amazonaws.com/KEY
    // https://BUCKET.s3.amazonaws.com/KEY
    let res = url.match(/https:\/\/s3\.amazonaws\.com\/(.+?)\/(.+)/i) ||
              url.match(/https:\/\/(.+?)\.s3.*?\.amazonaws\.com\/(.+)/i);
    if (!res) return null;
    return { bucket: decodeURIComponent(res[1]), key: decodeURIComponent(res[2]) };
}

/**
 * This is like Promise.all except it never rejects. It returns
 * an array of {v: <VALUE>, e: <ERROR>}
 */
export async function waitForAll(promises: Promise<*>[]): Promise<*> {
    return await Promise.all(promises.map(x => x.then(
        v => ({v}),
        e => {
            reportError(e);
            return {e};
        }
    )));
}

export async function waitForAllOmitErrors(promises: Promise<*>[]): Promise<*> {
    const ret = await waitForAll(promises);
    return ret.filter(x => !x.e).map(x => x.v);
}

export function callbackToPromise(f: Function, context?: Object) {
    return function() {
        return new Promise((resolve, reject) => {
            f.apply(context, Array.prototype.slice.apply(arguments).concat(
                (err, res) => err ? reject(err) : resolve(res)))
        });
    };
}

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
}

export function catchPromise(fn: Function) {
    return arity(fn.length, async function() {
        try {
            return await fn.apply(this, arguments);
        } catch(error) {
            reportError(error);
            throw error;
        }
    });
}
