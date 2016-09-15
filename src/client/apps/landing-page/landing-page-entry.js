/* @flow */
import { appState as initAppState } from '../../preamble.js';
import LandingPage from './landing-page.js';
import { dispatchAction, initUserFromCache } from './actions.js';
import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import { overwriteIntoDOM } from '../../client-utils.js';
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

    const compStr = rootComp.render();
    overwriteIntoDOM(compStr, document.getElementById('app-root'), true);
    rootComp.componentDidMount();
}

window.onload = main;
