/* @flow */

import type { AdminAppState } from './types';
import ice from 'icepick';

const initAppState: AdminAppState = ice.freeze({
    currentUser: {
        signedIn: false,
        attributes: {},
        conversationsState: {
            conversations: [],
            hasFetched: false,
        },
        messagesState: {
            messages: {},
            hasFetched: false,
        },
        botsState: {
            bots: [],
            hasFetched: false,
        },
        selectedBotId: null,
    }
});

export default initAppState;