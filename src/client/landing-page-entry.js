/* @flow */
import './process-env-vars.js';
import { LandingPage, dispatchAction } from './apps/landing-page/landing-page.js';
import EventSystem from './front-end-framework/event-system.js';
import { Cursor } from '../misc/atom.js';
import ice from 'icepick';

function main() {
    const props = {
        stateCursor: new Cursor(ice.freeze({
            a: { b: { c: 'booooo' } },
        })),
        eventSystem: new EventSystem(),
        dispatchAction: action => dispatchAction(props, action),
    };

    const rootComp = new LandingPage(props);

    // no need to render, it has been rendered on the server side
    // const compStr = rootComp.render();
    // console.log('root comp string: ', compStr);
    // const appRootElem = document.getElementById('app-root');
    // appRootElem.innerHTML = compStr;

    rootComp.componentDidMount();
}

window.onload = main;
