/* @flow */

import type { Cursor } from '../../../misc/atom.js';
import type { Conversation, DBMessage, BotParams } from '../../../misc/types.js';
import type EventSystem from '../../front-end-framework/event-system.js';
import type { BrowserHistory } from '../types.js';

export type Action = $Subtype<{
    type: string,
}>;

export type AdminAppState = {
    currentUser: {
        signedIn: boolean,
        attributes: {[key: string]: any},
        conversationsState: {
            conversations: Conversation[],
            hasFetched: boolean,
        },
        messagesState: {
            messages: {[key: string]: DBMessage[]},
            hasFetched: boolean,
        },
        botsState: {
            bots: BotParams[],
            hasFetched: boolean,
        },
        selectedBotId: ?string,
    },
};

export type AdminAppContext = {
    stateCursor: Cursor<AdminAppState>,
    eventSystem: EventSystem,
    dispatchAction: (action: Action) => Promise<*>,
    history: BrowserHistory,
};

export type AdminAppSubPageProps = {
    className: string,
};

