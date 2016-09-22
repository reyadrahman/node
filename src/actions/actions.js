/* @flow */

import * as aws from '../aws/aws.js';
import { destructureS3Url } from '../misc/utils.js';
import * as utils from '../client/client-utils.js';
import * as bridge from '../client/client-server-bridge.js';
import SignIn from '../components/sign-in/SignIn.jsx';
import SignUp from '../components/sign-up/SignUp.jsx';
import VerifyRegistration from '../components/verify-registration/VerifyRegistration.jsx';
import type { DBMessage, ResponseMessage } from '../misc/types.js';

import type { Component } from 'react';
import { browserHistory } from 'react-router'
import Cookies from 'js-cookie';

const { PLATFORM, S3_BUCKET_NAME } = utils.ENV;

// export function changeLocation(location: string) {
//     return { type: 'LOCATION', location };
// }

export function setSignInState(state) {
    return { type: 'SIGNIN', state };
}

export function setSignUpState(state) {
    return { type: 'SIGNUP', state };
}

export function setVerifyRegistrationState(state) {
    return { type: 'VERIFY_REGISTRATION', state };
}

export function signUpSucceeded(message: string) {
    return setSignUpState({
        errorMessage: '',
        successMessage: message,
    });
}
export function signUpFailed(message: string) {
    return setSignUpState({
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

export function signInSucceeded(message: string) {
    return setSignInState({
        errorMessage: '',
        successMessage: message,
    });
}

export function signInFailed(message: string) {
    return setSignInState({
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

export function openSignIn() {
    return (dispatch: Function) => {
        dispatch(setSignInState({ successMessage: '', errorMessage: '' }));
        dispatch(setModalComponent(SignIn));
    };
}

export function openSignUp() {
    return (dispatch: Function) => {
        dispatch(setSignUpState({ successMessage: '', errorMessage: '' }));
        dispatch(setModalComponent(SignUp));
    }
}

export function openVerifyRegistration(email?: string, password?: string) {
    return (dispatch: Function) => {
        dispatch(setModalComponent(VerifyRegistration));
        dispatch(setVerifyRegistrationState({
            initialEmail: email || '',
            password: password || '',
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
export function signUp(firstName, lastName, email, password) {
    return (dispatch: Function) => {
        return (
            aws.signUp(firstName, lastName, email, password)
               .then(res => {
                   console.log('signUp thunk SUCCESS. res: ', res);
                   dispatch(signUpSucceeded(''));
                   if (!res.userConfirmed) {
                       dispatch(openVerifyRegistration(email, password));
                   }
               })
               .catch(error => {
                   console.log('signUp thunk FAIL. err: ', error.message);
                   dispatch(signUpFailed(error.message));
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
                await dispatch(signIn(data.email, password));
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

export function signIn(email, password) {
    return async function (dispatch: Function) {
        try {
            const res = await aws.signIn(email, password);
            console.log('signIn thunk SUCCESS. res: ', res,
                        ', res.getAccessToken(): ', res.getAccessToken(),
                        ', res.getIdToken(): ', res.getIdToken());
            const attrs = await aws.getCurrentUserAttributes();
            console.log('user attributes: ', attrs);
            dispatch(setCurrentUserAttributes(attrs));
            dispatch(closeModal());
            browserHistory.push('/account');
        } catch(error) {
            console.log('signIn thunk FAIL. error: ', error.message);
            dispatch(signInFailed(error.message));
        }
    };
}

export function signOut() {
    return async function(dispatch: Function) {
        await aws.signOut();
        dispatch(clearCurrentUser());
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
            const currentUser = getState().currentUser;
            if (!currentUser || !currentUser.attributes) {
                return;
            }
            dispatch(setCurrentUserAttributes({
                ...currentUser.attributes,
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
    return async function(dispatch: Function) {
        try {
            await bridge.sendEmail(data);
            dispatch(sendEmailSucceeded('Message was sent, thanks'));
        } catch(error) {
            console.log('ERROR: sendEmail failed: ', error);
            dispatch(sendEmailFailed(`Sorry, couldn't send your message`));
        }
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
        let cardsP;
        if (clone.cards) {
            cardsP = Promise.all(clone.cards.map(async function(c) {
                const bucketAndKey = destructureS3Url(c.imageUrl);
                if (!bucketAndKey || bucketAndKey.bucket !== S3_BUCKET_NAME) {
                    return c;
                }

                const newImageUrl = await aws.s3GetSignedUrl('getObject', {
                    Bucket: bucketAndKey.bucket,
                    Key: bucketAndKey.key,
                    Expires: 60 * 60, // 1 hour
                });
                return {
                    ...c,
                    imageUrl: newImageUrl,
                };
            }));
        }

        if (cardsP) {
            clone.cards = await cardsP;
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

export function sendNotification(botId: string,
                                 message: ResponseMessage,
                                 categories: string[])
{
    return async function(dispatch: Function) {
        const session = await aws.getCurrentSession();
        await bridge.sendNotification(session.getIdToken().getJwtToken(),
                                      botId, message, categories);
    }
}
