/* @flow */
import { appState as initAppState } from '../../preamble.js';
import LandingPage from './landing-page.js';
import { dispatchAction, initUserFromCache } from './actions.js';
import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import { overwriteIntoDOM } from '../../client-utils.js';
import type { LandingPageAppContext } from './types';
import ice from 'icepick';

async function main() {
    const context: LandingPageAppContext = {
        stateCursor: new Cursor(ice.freeze(initAppState)),
        eventSystem: new EventSystem(),
        dispatchAction: action => dispatchAction(context, action),
    };

    try {
        await context.dispatchAction(initUserFromCache());
    } catch(error) {
        console.log(error);
    }

    const rootComp = new LandingPage(context);

    const compStr = rootComp.render();
    overwriteIntoDOM(compStr, document.getElementById('app-root'), true);
    rootComp.componentDidMount();
}

window.onload = main;
