/* @flow */
import { appState as initAppState } from '../../preamble.js';
import Admin from './admin.js';
import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import { dispatchAction } from './actions.js';
import ice from 'icepick';
import { createBrowserHistory } from 'history';


function main() {
    const props = {
        stateCursor: new Cursor(ice.freeze(initAppState)),
        eventSystem: new EventSystem(),
        dispatchAction: action => dispatchAction(props, action),
        history: createBrowserHistory(),
    };

    const rootComp = new Admin(props);

    const compStr = rootComp.render();
    console.log('root comp string: ', compStr);
    const appRootElem = document.getElementById('app-root');
    appRootElem.innerHTML = compStr;

    rootComp.componentDidMount();
}

window.onload = main;
