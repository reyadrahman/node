/* @flow */

import type { Cursor } from '../../../misc/atom.js';
import type EventSystem from '../../front-end-framework/event-system.js';

export type Action = $Subtype<{
    type: string,
}>;

export type LandingPageAppState = {
    a: {
        b: {
            c: string,
        }
    }
};

export type LandingPageAppProps = {
    stateCursor: Cursor<LandingPageAppState>,
    eventSystem: EventSystem,
    dispatchAction: (action: Action) => void,
};

