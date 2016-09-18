/* @flow */

import * as aws from '../../../aws/aws.js';
import type { LandingPageAppContext, Action } from './types.js';

export function signIn(email: string, password: string) {
    return { type: 'signIn', email, password };
}

async function handleSignIn(context, action) {
    try {
        await aws.signIn(action.email, action.password);
        // const attributes = await aws.getCurrentUserAttributes();
        // context.stateCursor.$assocIn('currentUser', {
        //     signedIn: true,
        //     attributes,
        // });
        window.location = '/admin';
    } catch(error) {
        context.stateCursor.$assocIn('currentUser', {
            signedIn: false,
        });
        context.eventSystem.publish('signInFailed', {
            errorMessage: error.message,
        });
        throw error;
    }
}

export function signOut() {
    return { type: 'signOut' };
}

async function handleSignOut(context, action) {
    await aws.signOut();
    context.stateCursor.$assocIn('currentUser', {
        signedIn: false,
        attributes: {},
    });
    context.eventSystem.publish('signedOut');
}

export function initUserFromCache() {
    return { type: 'initUserFromCache' };
}

async function handleInitUserFromCache(context, action) {
    try {
        const attributes = await aws.getCurrentUserAttributes();
        context.stateCursor.$assocIn('currentUser', {
            signedIn: true,
            attributes,
        });
    } catch(error) {
        context.stateCursor.$assocIn('currentUser', {
            signedIn: false,
            attributes: {},
        });
    }
}


export async function dispatchAction(context: LandingPageAppContext, action: Action) {
    console.log('--------- dispatchAction action: ', action);
    const beforeState = context.stateCursor.get();
    const t = action.type;
    let handler;

    if (t === 'signIn') {
        handler = handleSignIn;
    } else if (t === 'signOut') {
        handler = handleSignOut;
    } else if (t === 'initUserFromCache') {
        handler = handleInitUserFromCache;
    } else {
        console.error(`Unknown action type ${t}`);
        return;
    }

    try {
        console.log('--------- dispatchAction before state: ', beforeState);
        const res = handler(context, action);
        if (res instanceof Promise) {
            await res;
        }
        console.log('--------- dispatchAction after state: ', context.stateCursor.get());
    } catch(error) {
        console.log('--------- dispatchAction failed: ', error);
        throw error;
    }
}

