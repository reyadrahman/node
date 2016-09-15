/* @flow */
import { appState as initAppState } from '../../preamble.js';
import Admin from './admin.js';
import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import { dispatchAction, initUserFromCache } from './actions.js';
import * as actions from './actions.js';
import ice from 'icepick';
import { createBrowserHistory } from 'history';


async function main() {
    const props = {
        stateCursor: new Cursor(initAppState),
        eventSystem: new EventSystem(),
        dispatchAction: action => dispatchAction(props, action),
        history: createBrowserHistory(),
    };

    try {
        await props.dispatchAction(initUserFromCache());
    } catch(error) {
        window.location = '/';
    }

    const rootComp = new Admin(props);
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
