/* @flow */
import { appState as initAppState } from '../../preamble.js';
import LandingPage from './landing-page.js';
import { dispatchAction, initUserFromCache } from './actions.js';
import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import ice from 'icepick';

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
    console.log('root comp string: ', compStr);

    // TODO remove these 2 lines:
    const appRootElem = document.getElementById('app-root');
    appRootElem.innerHTML = compStr;

    rootComp.componentDidMount();
}

window.onload = main;
