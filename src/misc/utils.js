/* @flow */

import _ from 'lodash';

export function toStr(obj: any): string {
    return JSON.stringify(obj, null, ' ');
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

export function createUrlQuery(obj: {[key: string]: any}): string {
    const euc = encodeURIComponent;
    // $FlowFixMe
    return _.map(obj, (v, k) => `${euc(k)}=${euc(v)}`)
            .join('&');
}

// TODO remove this
function customEncodeURIComponent(comp) {
    // return encodeURIComponent(comp).replace(/\./g, '%2E').replace(/%20/g, '.');
    return encodeURIComponent(comp);
}

// TODO remove this
function customDecodeURIComponent(comp) {
    // return decodeURIComponent(comp.replace(/\./g, '%20'));
    return decodeURIComponent(comp);
}

// TODO remove this
export function searchQueryToPath(query: { searchPhrase: string, filterPhotographer: string }) {
    const comps = ['search', query.searchPhrase, query.filterPhotographer];
    const path = comps.filter(x => x).map(customEncodeURIComponent).join('/');
    return `/${path}`;
}

// TODO remove this
export function pathToSearchQuery(path: string) {
    if (!path) return null;
    const split = path.split('/').filter(x => x);
    if (split.length < 1) return null;
    return {
        searchPhrase: customDecodeURIComponent(split[0] || ''),
        filterPhotographer: customDecodeURIComponent(split[1] || ''),
    };
}

export function destructureS3Url(url: string): ?{ bucket: string, key: string} {
    let res = url.match(/https:\/\/(.*?)\.s3\.amazonaws\.com\/(.*)/);
    if (!res) return null;
    return { bucket: decodeURIComponent(res[1]), key: decodeURIComponent(res[2]) };
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
