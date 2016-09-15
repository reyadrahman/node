/* @flow */

import type { AdminAppProps, Action } from './types.js';
import type { DBMessage } from '../../../misc/types.js';
import { ENV as CLIENT_ENV } from '../../client-utils.js';
import { destructureS3Url } from '../../../misc/utils.js';
import * as aws from '../../../aws/aws.js';
import * as bridge from '../../client-server-bridge.js';

const { S3_BUCKET_NAME } = CLIENT_ENV;

export function initUserFromCache() {
    return { type: 'initUserFromCache' };
}

async function handleInitUserFromCache(props, action) {
    try {
        const attributes = await aws.getCurrentUserAttributes();
        props.stateCursor.$assocIn('currentUser', {
            signedIn: true,
            attributes,
            conversationsState: {
                conversations: [],
                hasFetched: false,
            },
            messagesState: {
                messages: {},
                hasFetched: false,
            }
        });
    } catch(error) {
        props.stateCursor.$assocIn('currentUser', {
            signedIn: false,
            attributes: {},
            conversationsState: {
                conversations: [],
                hasFetched: false,
            },
            messagesState: {
                messages: {},
                hasFetched: false,
            }
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

export function fetchConversations() {
    return { type: 'fetchConversations' };
}

async function handleFetchConversations(props, action) {
    props.stateCursor.$assocIn(['currentUser', 'conversationsState', 'isFetching'], true);
    try {
        const session = await aws.getCurrentSession();
        const conversations = await bridge.fetchConversations(
            session.getIdToken().getJwtToken()
        );
        props.stateCursor.$assocIn(['currentUser', 'conversationsState'], {
            hasFetched: true,
            conversations: conversations || [],
        });
        props.eventSystem.publish('fetchedConversations');

    } catch(error) {
        props.stateCursor.$assocIn(['currentUser', 'conversationsState'], {
            hasFetched: false,
            conversations: [],
        });
        console.error(error);
        props.eventSystem.publish('fetchingConversationsFailed', 'Could not fetch conversations');
    }
}

export function fetchMessages(conversationId: string) {
    return { type: 'fetchMessages', conversationId };
}

async function handleFetchMessages(props, action) {
    const { conversationId } = action;
    console.log('action: fetchMessages');
    props.stateCursor.$assocIn(['currentUser', 'messagesState'], {
        hasFetched: false,
        messages: [],
    });
    props.eventSystem.publish('fetchingMessages');
    try {
        const session = await aws.getCurrentSession();
        const messages = await bridge.fetchMessages(
            session.getIdToken().getJwtToken(),
            conversationId
        );
        console.log('handleFetchMessages before signing: ', messages);
        const messagesWithSignedUrls = await signS3UrlsInMesssages(messages);
        console.log('handleFetchMessages after signing: ', messagesWithSignedUrls);
        props.stateCursor.$assocIn(['currentUser', 'messagesState'], {
            hasFetched: true,
            messages: {
                [conversationId]: messagesWithSignedUrls,
            },
        });
        props.eventSystem.publish('fetchedMessages');
    } catch(error) {
        props.stateCursor.$assocIn(['currentUser', 'messagesState'], {
            hasFetched: false,
            messages: {},
        });
        console.error(error);
        props.eventSystem.publish('fetchingMessagesFailed', 'Could not fetch conversations');
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


export async function dispatchAction(props: AdminAppProps, action: Action) {
    console.log('--------- dispatchAction action: ', action);
    const beforeState = props.stateCursor.get();
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