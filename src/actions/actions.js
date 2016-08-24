/* @flow */

import * as aws from '../aws/aws.js';
import { destructureS3Url } from '../misc/utils.js';
import * as utils from '../client/client-utils.js';
import * as bridge from '../client/client-server-bridge.js';
import Signin from '../components/signin/Signin.jsx';
import Signup from '../components/signup/Signup.jsx';
import VerifyRegistration from '../components/verify-registration/VerifyRegistration.jsx';
import type { DBMessage } from '../misc/types.js';

import Cookies from 'js-cookie';
import type { Component } from 'react';

const { PLATFORM } = utils.ENV;

export function changeLocation(location: string) {
    return { type: 'LOCATION', location };
}

export function setSigninState(state) {
    return { type: 'SIGNIN', state };
}

export function setSignupState(state) {
    return { type: 'SIGNUP', state };
}

export function setVerifyRegistrationState(state) {
    return { type: 'VERIFY_REGISTRATION', state };
}

export function signupSucceeded(message: string) {
    return setSignupState({
        errorMessage: '',
        successMessage: message,
    });
}
export function signupFailed(message: string) {
    return setSignupState({
        errorMessage: message,
        successMessage: '',
    });
}

export function verifyRegistrationSucceeded(message: string) {
    return setVerifyRegistrationState({
        errorMessage: '',
        successMessage: message,
    });
}

export function verifyRegistrationFailed(message: string) {
    return setVerifyRegistrationState({
        errorMessage: message,
        successMessage: '',
    });
}

export function signinSucceeded(message: string) {
    return setSigninState({
        errorMessage: '',
        successMessage: message,
    });
}

export function signinFailed(message: string) {
    return setSigninState({
        errorMessage: message,
        successMessage: '',
    });
}

export function updateUserAttrsAndPassSucceeded(message) {
    return {
        type: 'CURRENT_USER',
        state: {
            updateUserAttrsAndPassErrorMessage: '',
            updateUserAttrsAndPassSuccessMessage: message,
        }
    }
}
export function updateUserAttrsAndPassFailed(errorMessage) {
    return {
        type: 'CURRENT_USER',
        state: {
            updateUserAttrsAndPassErrorMessage: errorMessage,
            updateUserAttrsAndPassSuccessMessage: '',
        }
    }
}
export function clearContactsMessages(message: string) {
    return {
        type: 'CONTACTS',
        state: {
            errorMessage: '',
            successMessage: '',
        }
    }
}
export function sendEmailSucceeded(message: string) {
    return {
        type: 'CONTACTS',
        state: {
            errorMessage: '',
            successMessage: message,
        }
    }
}
export function sendEmailFailed(message: string) {
    return {
        type: 'CONTACTS',
        state: {
            errorMessage: message,
            successMessage: '',
        }
    }
}
export function setCurrentUserAttributes(attributes) {
    return {
        type: 'CURRENT_USER',
        state: {
            attributes,
        }
    }
}
export function setCurrentUserBotsState(botsState) {
    return {
        type: 'CURRENT_USER/BOTS_STATE',
        state: botsState,
    }
}
export function setCurrentUserConversationsState(conversationsState) {
    return {
        type: 'CURRENT_USER/CONVERSATIONS_STATE',
        state: conversationsState,
    }
}
export function setCurrentUserMessagesCacheState(messagesCacheState) {
    return {
        type: 'CURRENT_USER/MESSAGES_CACHE_STATE',
        state: messagesCacheState,
    }
}
export function clearCurrentUser() {
    return {
        type: 'CURRENT_USER',
        state: null,
    }
}

export function setFullscreen(value: boolean) {
    return {
        type: 'UI',
        state: {
            fullscreen: value,
        },
    };
}

export function setModalComponent(modalComponent: Component<*,*,*>) {
    return {
        type: 'UI',
        state: {
            modalComponent,
        }
    }
}

export function closeModal() {
    return {
        type: 'UI',
        state: {
            modalComponent: null,
        }
    }
}

export function toggleSideMenu() {
    return {
        type: 'UI/TOGGLE_SIDE_MENU',
    };
}

export function setWebChatSessionToken(sessionToken: string) {
    return  {
        type: 'WEB_CHAT',
        state: {
            sessionToken,
        }
    };
}



// ==================================================
// Thunks
// ==================================================

export function openSignin() {
    return (dispatch: Function) => {
        dispatch(setSigninState({ successMessage: '', errorMessage: '' }));
        dispatch(setModalComponent(Signin));
    };
}

export function openSignup() {
    return (dispatch: Function) => {
        dispatch(setSignupState({ successMessage: '', errorMessage: '' }));
        dispatch(setModalComponent(Signup));
    }
}

export function openVerifyRegistration(data: { email?: string, password?: string } = {}) {
    return (dispatch: Function) => {
        dispatch(setModalComponent(VerifyRegistration));
        dispatch(setVerifyRegistrationState({
            initialEmail: data.email || '',
            password: data.password || '',
            errorMessage: '',
            successMessage: '',
        }))
    }
}

export function changeLang(lang: string) {
    return (dispatch: Function) => {
        dispatch({
            type: 'CHANGE_LANG',
            lang,
        });

        // TODO if logged in, if in browser etc.

        if (PLATFORM === 'browser') {
            Cookies.set('language', lang,
                        {expires: 1000, path: '/'});
            console.log('cookies: ', document.cookie);
        }
        return Promise.resolve();
    }
}
export function signup(data) {
    return (dispatch: Function) => {
        return (
            aws.signup(data)
               .then(res => {
                   console.log('signupThunk SUCCESS. res: ', res);
                   dispatch(signupSucceeded(''));
                   if (!res.userConfirmed) {
                       dispatch(openVerifyRegistration(data));
                   }
               })
               .catch(err => {
                   console.log('signupThunk FAIL. err: ', err.message);
                   dispatch(signupFailed(err.message));
               })
        );
    };
}

export function verifyRegistration(data) {
    return async function(dispatch: Function, getState: Function) {
        try {
            var res = await aws.verifyRegistration(data.email, data.code);
        } catch(error) {
            console.log('verifyRegistration FAILED. error: ', error);
            dispatch(verifyRegistrationFailed(error.message));
            return;
        }

        console.log('verifyRegistration SUCCESS. res: ', res);
        let password = getState().verifyRegistration.password;
        if (password) {
            try {
                await dispatch(signin({email: data.email, password}));
            } catch(error) {
                console.log(`verifyRegistration couldn't sign in after verification`, error);
            }
        }
        dispatch(setVerifyRegistrationState({
            successMessage: '',
            errorMessage: '',
            initialEmail: '',
            password: '',
        }));
        dispatch(closeModal());
    };
}

export function signin(data) {
    return (dispatch: Function) => {
        return (
            aws.signin(data)
               .then(res => {
                   console.log('signinThunk SUCCESS. res: ', res,
                               ', res.getAccessToken(): ', res.getAccessToken(),
                               ', res.getIdToken(): ', res.getIdToken());
                   return aws.getCurrentUserAttributes();
               })
               .then(attrs => {
                   console.log('user attributes: ', attrs);
                   dispatch(setCurrentUserAttributes(attrs));
                   dispatch(closeModal());

                   Cookies.set('loggedIn', 'yes',
                               {expires: 1000, path: '/'});
               })
               .catch(err => {
                   console.log('signinThunk FAIL. err: ', err.message);
                   dispatch(signinFailed(err.message));
               })
        );
    };
}

export function signout() {
    return (dispatch: Function) => {
        return (
            aws.signout()
               .then(() => {
                   dispatch(clearCurrentUser());
                   Cookies.remove('loggedIn', { path: '/' });
               })
        );
    };
}

// TODO validate input?
export function updateUserAttrsAndPass(attrs: Object,
                                       oldPassword?: string,
                                       newPassword?: string)
{
    return async function(dispatch: Function, getState: Function) {
        try {
            await aws.updateCurrentUserAttrsAndPass(attrs, oldPassword, newPassword);
            dispatch(setCurrentUserAttributes({
                ...getState().currentUser.attributes,
                ...attrs
            }));
            // TODO multi-lingual
            dispatch(updateUserAttrsAndPassSucceeded('Successfully updated'));

        } catch(error) {
            console.log('actions.updateUserAttrsAndPass failed: ', error);
            dispatch(updateUserAttrsAndPassFailed(error.message));
        }
    };
}

export function toggleFullscreen() {
    return (dispatch: Function) => {
        if (utils.isFullscreen()) {
            utils.exitFullscreen();
        } else {
            utils.requestFullscreen();
        }
    };
}

export function sendEmail(data) {
    return (dispatch: Function) => {
        return (
            aws.sendEmail(data)
               .then(res => {
                   console.log('sendEmail, SUCCESS', res);
                   dispatch(sendEmailSucceeded(res));
               })
               .catch(err => {
                   console.log('sendEmail, FAILURE', err);
                   dispatch(sendEmailFailed(typeof err === 'string' ? err : 'Failed'));
               })
        );
    }
}

export function addBot(botName: string, data) {
    return async function(dispatch: Function) {
        const session = await aws.getCurrentSession();
        await bridge.addBot(session.getIdToken().getJwtToken(), botName, data);
    }
}

export function fetchBots() {
    return async function(dispatch: Function) {
        dispatch(setCurrentUserBotsState({
            isFetchingBotsState: true,
            errorMessage: '',
        }));
        try {
            const session = await aws.getCurrentSession();
            const bots = await bridge.fetchBots(session.getIdToken().getJwtToken());
            dispatch(setCurrentUserBotsState({
                isFetchingBotsState: false,
                errorMessage: '',
                bots,
            }))
        } catch(err) {
            dispatch(setCurrentUserBotsState({
                isFetchingBotsState: false,
                errorMessage: 'Could not fetch the bots',
            }));
        }
    }
}

export function fetchConversations() {
    return async function(dispatch: Function) {
        dispatch(setCurrentUserConversationsState({
            isFetchingConversationsState: true,
            errorMessage: '',
        }));
        try {
            const session = await aws.getCurrentSession();
            const conversations = await bridge.fetchConversations(
                session.getIdToken().getJwtToken()
            );
            dispatch(setCurrentUserConversationsState({
                isFetchingConversationsState: false,
                errorMessage: '',
                conversations,
            }));
        } catch(error) {
            dispatch(setCurrentUserConversationsState({
                isFetchingConversationsState: false,
                errorMessage: 'Could not fetch the bots',
            }));
        }
    }

}

export function fetchMessages(conversationId: string) {
    console.log('action: fetchMessages');
    return async function(dispatch: Function) {
        dispatch(setCurrentUserMessagesCacheState({
            isFetchingMessagesCacheState: true,
            errorMessage: '',
        }));
        try {
            const session = await aws.getCurrentSession();
            const messages = await bridge.fetchMessages(
                session.getIdToken().getJwtToken(),
                conversationId
            );
            console.log('fetchMessages before signing: ', messages);
            const messagesWithSignedUrls = await signS3UrlsInMesssages(messages);
            console.log('fetchMessages after signing: ', messagesWithSignedUrls);
            dispatch(setCurrentUserMessagesCacheState({
                isFetchingMessagesCacheState: false,
                errorMessage: '',
                // TODO append to cache instead of replace
                messagesCache: {
                    [conversationId]: messagesWithSignedUrls,
                },
            }));
        } catch(error) {
            dispatch(setCurrentUserMessagesCacheState({
                isFetchingMessagesCacheState: false,
                errorMessage: 'Could not fetch the bots',
            }));
        }
    }

}

async function signS3UrlsInMesssages(messages: DBMessage[]): Promise<DBMessage[]> {
    return await Promise.all(messages.map(async function(m) {
        const clone = { ...m };
        let filesP, quickRepliesP;
        if (clone.files) {
            filesP = Promise.all(clone.files.map(async function(f) {
                const bucketAndKey = destructureS3Url(f);
                if (!bucketAndKey) return f;

                return await aws.s3GetSignedUrl('getObject', {
                    Bucket: bucketAndKey.bucket,
                    Key: bucketAndKey.key,
                    Expires: 60 * 60, // 1 hour
                });
            }));
        }
        if (clone.quickReplies) {
            quickRepliesP = Promise.all(clone.quickReplies.map(async function(q) {
                if (typeof q === 'string') return q;
                if (!q.file) return q;
                const bucketAndKey = destructureS3Url(q.file);
                if (!bucketAndKey) return q;

                return {
                    ...q,
                    file: await aws.s3GetSignedUrl('getObject', {
                        Bucket: bucketAndKey.bucket,
                        Key: bucketAndKey.key,
                        Expires: 60 * 60, // 1 hour
                    }),
                };
            }));
        }

        if (filesP) {
            clone.files = await filesP;
        }
        if (quickRepliesP) {
            clone.quickReplies = await quickRepliesP;
        }
        return clone;
    }));
}

export function fetchWebChatSessionToken() {
    return async function(dispatch: Function) {
        let session;
        try {
            session = await aws.getCurrentSession();
        } catch(error) { }

        const token = await bridge.fetchWebChatSessionToken(
            session && session.getIdToken().getJwtToken()
        );
        dispatch(setWebChatSessionToken(token));
    }
}
