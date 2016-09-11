/* @flow */

import type { Cursor } from '../../../misc/atom.js';
import type EventSystem from '../../front-end-framework/event-system.js';

export type Action = $Subtype<{
    type: string,
}>;

export type AdminAppState = {
    location: {
        path: string,
    },
};

export type AdminAppProps = {
    stateCursor: Cursor<AdminAppState>,
    eventSystem: EventSystem,
    dispatchAction: (action: Action) => void,
    history: any, // TODO type of history?
};

