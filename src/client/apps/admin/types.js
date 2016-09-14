/* @flow */

import type { Cursor } from '../../../misc/atom.js';
import type EventSystem from '../../front-end-framework/event-system.js';

export type Action = $Subtype<{
    type: string,
}>;

export type AdminAppState = {
    currentUser: {
        signedIn: boolean,
        attributes: {[key: string]: any},
    }
};

export type AdminAppProps = {
    stateCursor: Cursor<AdminAppState>,
    eventSystem: EventSystem,
    dispatchAction: (action: Action) => Promise<*>,
    history: any, // TODO type of history?
};

