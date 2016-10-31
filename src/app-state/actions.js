/* @flow */

import * as aws from '../aws/aws.js';
import { destructureS3Url } from '../misc/utils.js';
import { CONSTANTS } from '../client/client-utils.js';
import * as bridge from '../client/client-server-bridge.js';
import SignIn from '../components/sign-in/SignIn.jsx';
import SignUp from '../components/sign-up/SignUp.jsx';
import VerifyRegistration from '../components/verify-registration/VerifyRegistration.jsx';
import type { DBMessage, ResponseMessage, FeedConfig } from '../misc/types.js';
import type { Component } from 'react';
import { browserHistory } from 'react-router'
import Cookies from 'js-cookie';
const reportDebug = require('debug')('deepiks:actions');
const reportError = require('debug')('deepiks:actions:error');

export function closeModal() {
    return { type: 'ui/closeModal' };
}

export function setModal(modalComponent) {
    return { type: 'ui/setModal', modalComponent };
}

export function toggleSideMenu() {
    return { type: 'ui/toggleSideMenu' };
}

export function selectBot(botId) {
    return { type: 'currentUser/selectBot', botId };
}

export function setBots(bots) {
    return {type: 'currentUser/setBotsAndUpdateSelectedBotId', bots};
}

// ==================================================
// Thunks
// ==================================================

export function openSignIn() {
    return (dispatch: Function) => {
        dispatch({ type: 'signIn/reset' });
        dispatch({ type: 'ui/setModal', modalComponent: SignIn });
    };
}

export function openSignUp() {
    return (dispatch: Function) => {
        dispatch({ type: 'signUp/reset' });
        dispatch({ type: 'ui/setModal', modalComponent: SignUp });
    }
}

export function openVerifyRegistration(email?: string, password?: string) {
    return (dispatch: Function) => {
        dispatch({
            type: 'verifyRegistration/set',
            initialEmail: email || '',
            password: password || '',
        });
        dispatch({ type: 'ui/setModal', modalComponent: VerifyRegistration });
    }
}

export function setLanguage(lang: string) {
    return (dispatch: Function) => {
        dispatch({
            type: 'lang/set',
            lang,
        });

        // TODO if logged in, store in AWS Cognito attributes

        if (CONSTANTS.PLATFORM === 'browser') {
            Cookies.set('language', lang,
                        {expires: 1000, path: '/'});
            reportDebug('cookies: ', document.cookie);
        }
        return Promise.resolve();
    }
}

export function signUp(firstName, lastName, email, password) {
    return async function(dispatch: Function) {
        try {
            const res = await aws.signUp(firstName, lastName, email, password);
            reportDebug('signUp thunk SUCCESS. res: ', res);
            if (!res.userConfirmed) {
               dispatch(openVerifyRegistration(email, password));
            }
        } catch(error) {
            reportError('signUp thunk FAIL. error: ', error.code, error.message);
            dispatch({ type: 'signUp/failed', errorCode: error.code });
        }
    };
}

export function verifyRegistration(data) {
    return async function(dispatch: Function, getState: Function) {
        try {
            var res = await aws.verifyRegistration(data.email, data.code);
        } catch(error) {
            reportError('verifyRegistration FAILED. error: ', error.code, error.message);
            dispatch({ type: 'verifyRegistration/failed', errorCode: error.code });
            return;
        }

        reportDebug('verifyRegistration SUCCESS. res: ', res);
        let password = getState().verifyRegistration.password;
        if (password) {
            try {
                await dispatch(signIn(data.email, password));
            } catch(error) {
                reportDebug(`verifyRegistration couldn't sign in after verification`, error);
            }
        }
        dispatch({ type: 'verifyRegistration/reset' });
        dispatch({ type: 'ui/closeModal' });
    };
}

export function signIn(email, password) {
    return async function (dispatch: Function) {
        try {
            const res = await aws.signIn(email, password);
            reportDebug('signIn thunk SUCCESS. res: ', res,
                        ', res.getAccessToken(): ', res.getAccessToken(),
                        ', res.getIdToken(): ', res.getIdToken());
            const attributes = await aws.getCurrentUserAttributes();
            reportDebug('user attributes: ', attributes);
            dispatch({ type: 'currentUser/signIn', attributes });
            dispatch({ type: 'ui/closeModal' });
            browserHistory.push('/test');
        } catch(error) {
            reportDebug('signIn thunk FAIL. error: ', error.code, error.message);
            dispatch({ type: 'signIn/failed', errorCode: error.code });
        }
    };
}

export function signOut() {
    return async function(dispatch: Function) {
        await aws.signOut();
        dispatch({ type: 'currentUser/signOut' });
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
            if (!currentUser.signedIn) {
                return;
            }
            dispatch({ type: 'currentUser/signIn',
                attributes: {
                    ...currentUser.attributes,
                    ...attrs,
                }
            });
            dispatch({ type: 'currentUser/updateAttrsAndPassSucceeded', successCode: 'UserUpdateSuccess' });

        } catch(error) {
            reportDebug('actions.updateUserAttrsAndPass failed: ', error.code, error);
            dispatch({ type: 'currentUser/updateAttrsAndPassFailed', errorCode: error.code });
        }
    };
}

export function sendEmail(data) {
    return async function(dispatch: Function) {
        dispatch({ type: 'contacts/sending' });
        try {
            await bridge.sendEmail(data);
            dispatch({ type:'contacts/succeded', successCode: 'SendEmailSuccess' });
        } catch(error) {
            reportDebug('ERROR: sendEmail failed: ', error.code, error.message);
            dispatch({ type: 'contacts/failed', errorCode: error.code });
        }
    }
}

export function addBot(botName: string, data) {
    return async function(dispatch: Function) {
        const session = await aws.getCurrentSession();
        await bridge.addBot(session.getIdToken().getJwtToken(), botName, data);
    }
}

export function updateBot(botId: string, data) {
    return async function (dispatch: Function) {
        const session = await aws.getCurrentSession();
        return await bridge.updateBot(session.getIdToken().getJwtToken(), botId, data);
    }
}

export function fetchBots() {
    return async function(dispatch: Function, getState: Function) {
        dispatch({ type: 'currentUser/resetBotsState' });
        try {
            const session = await aws.getCurrentSession();
            const bots = await bridge.fetchBots(session.getIdToken().getJwtToken());
            dispatch(setBots(bots));
        } catch(error) {
            reportError('fetchBots', error.code, error.message);
            dispatch({
                type:         'currentUser/fetchBotsFailed',
                errorCode: error.code,
            });
        }
    }
}

export function fetchBotPublicInfo(publisherId, botId) {
    return async function (dispatch: Function) {
        return bridge.fetchBotPublicInfo(publisherId, botId);
    }
}

export function fetchUsers(botId) {
    return async function(dispatch: Function) {
        dispatch({ type: 'currentUser/resetUsersState' });
        try {
            const session = await aws.getCurrentSession();
            const users = await bridge.fetchUsers(
                session.getIdToken().getJwtToken(),
                botId
            );
            dispatch({
                type: 'currentUser/setUsersState',
                      users,
            });
        } catch(error) {
            reportError('fetchUsers', error.code, error.messsage);
            dispatch({
                type: 'currentUser/fetchUsersFailed',
                errorCode: error.code,
            });
        }
    }
}

export function fetchPolls(botId) {
    return async function (dispatch: Function) {
        const session = await aws.getCurrentSession();
        return bridge.fetchPolls(
            session.getIdToken().getJwtToken(),
            botId
        );
    }
}

export function fetchUser(botId, channel, userId) {
    return async function (dispatch: Function) {
        const session = await aws.getCurrentSession();
        return bridge.fetchUser(
            session.getIdToken().getJwtToken(),
            botId, channel, userId
        );
    }
}

export function saveUser(botId, channel, userId, email, role) {
    return async function (dispatch: Function) {
        const session = await aws.getCurrentSession();
        return bridge.saveUser(
            session.getIdToken().getJwtToken(),
            botId, channel, userId, email, role
        );
    }
}

export function updateConversations(botId, since: number = 0) {
    return async function (dispatch: Function) {
        try {
            const session       = await aws.getCurrentSession();
            const conversations = await bridge.fetchConversations(
                session.getIdToken().getJwtToken(),
                botId, since
            );
            if (conversations.length) {
                dispatch({
                    type:        'currentUser/updateConversationsState',
                                 conversations,
                    lastUpdated: moment().format('x')
                });
            }
        } catch (error) {
            reportError(error);
        }
    }
}

export function fetchConversations(botId) {
    return async function(dispatch: Function) {
        dispatch({ type: 'currentUser/resetConversationsState' });
        try {
            const session = await aws.getCurrentSession();
            const conversations = await bridge.fetchConversations(
                session.getIdToken().getJwtToken(),
                botId
            );
            dispatch({
                type:        'currentUser/setConversationsState',
                             conversations,
                lastUpdated: moment().format('x')
            });
        } catch(error) {
            reportError('fetchConversations', error.code, error.message);
            dispatch({
                type: 'currentUser/fetchConversationsFailed',
                errorCode: error.code,
            });
        }
    }

}

export function updateMessages(conversationId: string, since: number = 0) {
    reportDebug('action: fetchMessages');
    return async function (dispatch: Function) {
        try {
            const session  = await aws.getCurrentSession();
            const messages = await bridge.fetchMessages(
                session.getIdToken().getJwtToken(),
                conversationId, since
            );

            if (messages.length) {
                const messagesWithSignedUrls = await signS3UrlsInMesssages(messages);
                dispatch({
                    type:        'currentUser/updateMessagesState',
                    messages:    messagesWithSignedUrls,
                    lastUpdated: moment().format('x')
                });
            }
        } catch (error) {
            reportError(error);
        }
    }

}

export function fetchMessages(conversationId: string) {
    reportDebug('action: fetchMessages');
    return async function(dispatch: Function) {
        dispatch({ type: 'currentUser/resetMessagesState' });
        try {
            const session = await aws.getCurrentSession();
            const messages = await bridge.fetchMessages(
                session.getIdToken().getJwtToken(),
                conversationId
            );
            reportDebug('fetchMessages before signing: ', messages);
            const messagesWithSignedUrls = await signS3UrlsInMesssages(messages);
            reportDebug('fetchMessages after signing: ', messagesWithSignedUrls);
            dispatch({
                type:        'currentUser/setMessagesState',
                messages:    messagesWithSignedUrls,
                lastUpdated: moment().format('x')
            });
        } catch(error) {
            reportError('fetchMessage', error.code, error.message);
            dispatch({
                type: 'currentUser/fetchMessagesFailed',
                errorCode: error.code,
            });
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
                if (!bucketAndKey || bucketAndKey.bucket !== CONSTANTS.S3_BUCKET_NAME) {
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

export function addBotFeed(botId: string, feedConfig: FeedConfig) {
    return async function(dispatch: Function) {
        try {
            const session = await aws.getCurrentSession();
            await bridge.addBotFeed(session.getIdToken().getJwtToken(), botId, feedConfig);
        } catch(error) {
            reportError(error);
            // TODO show error message to user
        }
        dispatch(fetchBots());
    };
}

