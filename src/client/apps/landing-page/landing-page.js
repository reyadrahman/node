/* @flow */

import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import App from '../../front-end-framework/app.js';
import { ENV as CLIENT_ENV } from '../../client-utils.js';
import * as actions from './actions.js';
import Router from '../../common-components/router.js';
import FrontPage from './components/front-page.js';
import TermsPage from './components/terms-page.js';
import PrivacyPage from './components/privacy-page.js';
import Layout from './components/layout.js';

// this will import ./landio.js on the server and ./landio.web.js on the client
import initLandio from './landio';

import type { LandingPageAppContext, Action } from './types.js';

import './scss/landio.scss';

const { PUBLIC_URL } = CLIENT_ENV;

export default class LandingPage extends App<LandingPageAppContext, null> {
    static getScripts(): string[] {
        return [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
            `${PUBLIC_URL}landingPage.js`,
        ];
    }

    static getStyleSheets(): string[] {
        return [
            `${PUBLIC_URL}landingPage.css`,
        ];
    }

    static getRoutes() {
        return [
            [ '/',      FrontPage     ],
            [ '/privacy', PrivacyPage ],
            [ '/terms', TermsPage     ],
        ];
    }

    componentDidMount() {
        super.componentDidMount();
        initLandio();
    }

    render() {
        this.unmountChildren();
        const router = this.addChild(new Router(this.context, {
            routes: LandingPage.getRoutes(),
        }), 'router');

        const layout = this.addChild(new Layout(this.context, {
            contentComponent: router,
        }), 'layout');

        return layout.render();
    }
}
