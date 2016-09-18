/* @flow */

import { ENV as CLIENT_ENV } from '../../client-utils.js';
import { destructureS3Url } from '../../../misc/utils.js';
import * as aws from '../../../aws/aws.js';
import * as bridge from '../../client-server-bridge.js';
import initAppState from './init-app-state.js';
import type { AdminAppContext, Action } from './types.js';
import type { DBMessage, FeedConfig } from '../../../misc/types.js';
import isEmpty from 'lodash/isEmpty';

const { S3_BUCKET_NAME } = CLIENT_ENV;

export function initUserFromCache() {
    return { type: 'initUserFromCache' };
}

async function handleInitUserFromCache(context, action) {
    try {
        const attributes = await aws.getCurrentUserAttributes();
        context.stateCursor.$assocIn('currentUser', {
            ...initAppState.currentUser,
            signedIn: true,
            attributes,
        });
    } catch(error) {
        context.stateCursor.$assocIn('currentUser', initAppState.currentUser);
        throw error;
    }
}

export function signOut() {
    return { type: 'signOut' };
}

async function handleSignOut(context, action) {
    await aws.signOut();
    window.location = '/';
}

export function fetchConversations() {
    return { type: 'fetchConversations' };
}

async function handleFetchConversations(context, action) {
    context.stateCursor.$assocIn(['currentUser', 'conversationsState', 'isFetching'], true);
    try {
        const session = await aws.getCurrentSession();
        const conversations = await bridge.fetchConversations(
            session.getIdToken().getJwtToken()
        );
        context.stateCursor.$assocIn(['currentUser', 'conversationsState'], {
            hasFetched: true,
            conversations: conversations || [],
        });
        context.eventSystem.publish('fetchedConversations');

    } catch(error) {
        context.stateCursor.$assocIn(['currentUser', 'conversationsState'],
            initAppState.currentUser.conversationsState);
        console.error(error);
        context.eventSystem.publish('fetchingConversationsFailed', 'Could not fetch conversations');
    }
}

export function fetchMessages(conversationId: string) {
    return { type: 'fetchMessages', conversationId };
}

async function handleFetchMessages(context, action) {
    const { conversationId } = action;
    console.log('action: fetchMessages');
    context.stateCursor.$assocIn(['currentUser', 'messagesState'], {
        hasFetched: false,
        messages: [],
    });
    context.eventSystem.publish('fetchingMessages');
    try {
        const session = await aws.getCurrentSession();
        const messages = await bridge.fetchMessages(
            session.getIdToken().getJwtToken(),
            conversationId
        );
        console.log('handleFetchMessages before signing: ', messages);
        const messagesWithSignedUrls = await signS3UrlsInMesssages(messages);
        console.log('handleFetchMessages after signing: ', messagesWithSignedUrls);
        context.stateCursor.$assocIn(['currentUser', 'messagesState'], {
            hasFetched: true,
            messages: {
                [conversationId]: messagesWithSignedUrls,
            },
        });
        context.eventSystem.publish('fetchedMessages');
    } catch(error) {
        context.stateCursor.$assocIn(['currentUser', 'messagesState'],
            initAppState.currentUser.messagesState);
        console.error(error);
        context.eventSystem.publish('fetchingMessagesFailed', 'Could not fetch conversations');
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


export function fetchBots() {
    return { type: 'fetchBots' };
}

async function handleFetchBots(context, action) {
    try {
        const session = await aws.getCurrentSession();
        const bots = await bridge.fetchBots(
            session.getIdToken().getJwtToken()
        );
        context.stateCursor.$assocIn(['currentUser', 'botsState'], {
            bots,
            hasFetched: true,
        });
        if (!context.stateCursor.getIn(['currentUser', 'selectedBotId']) && !isEmpty(bots)) {
            context.stateCursor.$assocIn(['currentUser', 'selectedBotId'], bots[0].botId);
        }
        context.eventSystem.publish('fetchedBots');
    } catch(error) {
        console.error('Error while fetching bots: ', error);
        context.stateCursor.$assocIn(['currentUser', 'botsState'],
            initAppState.currentUser.botsState);
    }
}

export function selectBot(botId: string) {
    return { type: 'selectBot', botId };
}

function handleSelectBot(context, action) {
    context.stateCursor.$assocIn(['currentUser', 'selectedBotId'], action.botId);
    context.eventSystem.publish('selectedBot');
}

export function addBotFeed(botId: string, feedConfig: FeedConfig) {
    return { type: 'addBotFeed', botId, feedConfig };
}

async function handleAddBotFeed(context, action) {
    const session = await aws.getCurrentSession();
    await bridge.addBotFeed(session.getIdToken().getJwtToken(), action.botId, action.feedConfig);
}

export async function dispatchAction(context: AdminAppContext, action: Action) {
    console.log('--------- dispatchAction action: ', action);
    const beforeState = context.stateCursor.get();
    const t = action.type;
    let handler;

    if (t === 'signOut') {
        handler = handleSignOut;
    } else if (t === 'initUserFromCache') {
        handler = handleInitUserFromCache;
    } else if (t === 'fetchConversations') {
        handler = handleFetchConversations;
    } else if (t === 'fetchMessages') {
        handler = handleFetchMessages;
    } else if (t === 'fetchBots') {
        handler = handleFetchBots;
    } else if (t === 'selectBot') {
        handler = handleSelectBot;
    } else if (t === 'addBotFeed') {
        handler = handleAddBotFeed;
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