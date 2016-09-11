/* @flow */

import type { AdminAppProps, Action } from './types.js';

export function changeLocation(path: string) {
    return { type: 'changeLocation', path };
}

export function dispatchAction(props: AdminAppProps, action: Action) {
    console.log('--------- dispatchAction before: ', props.stateCursor.get());
    // example:
    if (action.type === 'changeLocation') {
        props.stateCursor.$assocIn(['location', 'path'], action.path);
        props.eventSystem.publish('locationChanged');
        props.history.push(action.path);
    }
    console.log('--------- dispatchAction after: ', props.stateCursor.get());
}
