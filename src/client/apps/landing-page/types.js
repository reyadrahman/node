/* @flow */

import type { Cursor } from '../../../misc/atom.js';
import type EventSystem from '../../front-end-framework/event-system.js';

export type Action = $Subtype<{
    type: string,
}>;

export type LandingPageAppState = {
    currentUser: {
        signedIn: boolean,
        attributes: {[key: string]: any},
    }
};

export type LandingPageAppContext = {
    stateCursor: Cursor<LandingPageAppState>,
    eventSystem: EventSystem,
    dispatchAction: (action: Action) => Promise<*>,
};

