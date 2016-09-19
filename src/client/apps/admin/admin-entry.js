/* @flow */
import { appState as initAppStateFromServer } from '../../preamble.js';
import Admin from './admin.js';
import initAppState from './init-app-state.js';
import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import { dispatchAction, initUserFromCache } from './actions.js';
import * as actions from './actions.js';
import { overwriteIntoDOM } from '../../client-utils.js';
import type { AdminAppContext } from './types';
import ice from 'icepick';
import { createBrowserHistory } from 'history';
import isEmpty from 'lodash/isEmpty';

function main() {
    mainAsync().catch(error => console.error(error));
}

async function mainAsync() {
    const appState = isEmpty(initAppStateFromServer) ? initAppState : initAppStateFromServer;
    const context: AdminAppContext = {
        stateCursor: new Cursor(appState),
        eventSystem: new EventSystem(),
        dispatchAction: action => dispatchAction(context, action),
        history: createBrowserHistory(),
    };

    try {
        await context.dispatchAction(initUserFromCache());
    } catch(error) {
        window.location = '/';
    }

    const rootComp = new Admin(context);
    const compStr = rootComp.render();
    overwriteIntoDOM(compStr, document.getElementById('app-root'), true);
    rootComp.componentDidMount();
}

window.onload = main;
