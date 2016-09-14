/* @flow */

import type { AdminAppProps, Action } from './types.js';
import * as aws from '../../../aws/aws.js';


export function initUserFromCache() {
    return { type: 'initUserFromCache' };
}

async function handleInitUserFromCache(props, action) {
    try {
        const attributes = await aws.getCurrentUserAttributes();
        props.stateCursor.$assocIn('currentUser', {
            signedIn: true,
            attributes,
        });
    } catch(error) {
        props.stateCursor.$assocIn('currentUser', {
            signedIn: false,
            attributes: {},
        });
        throw error;
    }
}

export function signOut() {
    return { type: 'signOut' };
}

async function handleSignOut(props, action) {
    await aws.signOut();
    window.location = '/';
}

export async function dispatchAction(props: AdminAppProps, action: Action) {
    console.log('--------- dispatchAction action: ', action);
    const beforeState = props.stateCursor.get();
    const t = action.type;
    let handler;

    if (t === 'signOut') {
        handler = handleSignOut;
    } else if (t === 'initUserFromCache') {
        handler = handleInitUserFromCache;
    } else {
        console.error(`Unknown action type ${t}`);
        return;
    }

    try {
        console.log('--------- dispatchAction before state: ', beforeState);
        const res = handler(props, action);
        if (res instanceof Promise) {
            await res;
        }
        console.log('--------- dispatchAction after state: ', props.stateCursor.get());
    } catch(error) {
        console.log('--------- dispatchAction failed: ', error);
        throw error;
    }
}