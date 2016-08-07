/* @flow */

import _ from 'lodash';
import type { ServerEnv, ClientEnv } from './types.js';

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
