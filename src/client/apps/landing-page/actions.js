/* @flow */

import type { LandingPageAppProps, Action } from './types.js';

// example:
export function example(path: string) {
    return { type: 'example', value: 'example value' };
}

export function dispatchAction(props: LandingPageAppProps, action: Action) {
    console.log('--------- dispatchAction before: ', props.stateCursor.get());
    // example:
    if (action.type === 'example') {
        props.stateCursor.$assocIn(['a', 'b', 'c'], action.value);
    }
    console.log('--------- dispatchAction after: ', props.stateCursor.get());
}
