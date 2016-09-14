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
    console.log('root comp string: ', compStr);
    const appRootElem = document.getElementById('app-root');
    appRootElem.innerHTML = compStr;

    rootComp.componentDidMount();
}

window.onload = main;
