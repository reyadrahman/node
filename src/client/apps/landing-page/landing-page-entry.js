/* @flow */
import { appState as initAppState } from '../../preamble.js';
import LandingPage from './landing-page.js';
import { dispatchAction, initUserFromCache } from './actions.js';
import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import { ENV as CLIENT_ENV } from '../../client-utils.js';
import ice from 'icepick';

const { NODE_ENV } = CLIENT_ENV;

async function main() {
    const props = {
        stateCursor: new Cursor(ice.freeze(initAppState)),
        eventSystem: new EventSystem(),
        dispatchAction: action => dispatchAction(props, action),
    };

    try {
        await props.dispatchAction(initUserFromCache());
    } catch(error) {}

    const rootComp = new LandingPage(props);

    // call render just to create the hierarchy of children
    // but don't set the DOM because the server already has
    // rendered it into the DOM
    const compStr = rootComp.render();

    const appRootElem = $('#app-root');
    const appRootOldStr = $('#app-root').html();
    if (appRootOldStr.trim()) {
        if (appRootOldStr !== compStr) {
            console.group();
            console.error('Client-side rendered element and server-side ' +
                          'rendered elements are not the same. Will be ' +
                          'overwritten by the client-side value');
            console.error('Server-side rendered element: ', appRootOldStr);
            console.error('Client-side rendered element: ', compStr);
            console.groupEnd();
            appRootElem.html(compStr);
        }
    } else {
        appRootElem.html(compStr);
    }
    
    rootComp.componentDidMount();
}

window.onload = main;
