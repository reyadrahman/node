/* @flow */

import * as aws from '../../../aws/aws.js';
import type { LandingPageAppProps, Action } from './types.js';
import Cookies from 'js-cookie';

export function signIn(email: string, password: string) {
    return { type: 'signIn', email, password };
}

async function handleSignIn(props, action) {
    try {
        await aws.signIn(action.email, action.password);
        Cookies.set('signedIn', 'yes', { expires: 1000, path: '/' });
        // const attributes = await aws.getCurrentUserAttributes();
        // props.stateCursor.$assocIn('currentUser', {
        //     signedIn: true,
        //     attributes,
        // });
        window.location = '/admin';
    } catch(error) {
        props.stateCursor.$assocIn('currentUser', {
            signedIn: false,
        });
        props.eventSystem.publish('signInFailed', {
            errorMessage: error.message,
        });
        throw error;
    }
}

export function signOut() {
    return { type: 'signOut' };
}

async function handleSignOut(props, action) {
    await aws.signOut();
    props.stateCursor.$assocIn('currentUser', {
        signedIn: false,
        attributes: {},
    });
    props.eventSystem.publish('signedOut');
}

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
    }
}


export async function dispatchAction(props: LandingPageAppProps, action: Action) {
    console.log('--------- dispatchAction action: ', action);
    const beforeState = props.stateCursor.get();
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

