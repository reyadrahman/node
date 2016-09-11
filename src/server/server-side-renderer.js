/* @flow */

import { languages } from '../client/i18n/translations.js';
import { ENV as CLIENT_ENV } from '../client/client-utils.js';
import LandingPage from '../client/apps/landing-page/landing-page.js';
import Admin from '../client/apps/admin/admin.js';
import EventSystem from '../client/front-end-framework/event-system.js';
import type App from '../client/front-end-framework/app.js';
import { Cursor } from '../misc/atom.js';
import { sanitizeAndStringifyObj } from './server-utils.js';
import express from 'express';
import type { Request, Response } from 'express';
import ice from 'icepick';
import { createMemoryHistory } from 'history';

const routes = express.Router();

const { PUBLIC_URL } = CLIENT_ENV;

export function renderLandingPageApp(req: Request, res: Response, next: Function): string {
    const props = {
        stateCursor: new Cursor(ice.freeze({
            // example state:
            a: { b: { c: 'booooo' } },
        })),
        // TODO use a mock EventSystem
        eventSystem: new EventSystem(),
        dispatchAction: action => {},
    };

    const app = new LandingPage(props);
    return render(app, props.stateCursor.get(), true, req, res);
}

export function renderAdminApp(req: Request, res: Response, next: Function): string {
    const props = {
        stateCursor: new Cursor(ice.freeze({
            location: {
                path: req.baseUrl + req.path,
            }
        })),
        // TODO use a mock EventSystem
        eventSystem: new EventSystem(),
        dispatchAction: action => {},
        history: createMemoryHistory(),
    };

    const app = new Admin(props);
    return render(app, props.stateCursor.get(), false, req, res);
}

function render(app: App<*>, appState, shouldRender, req, res): string {

    const systemLang = req.acceptsLanguages(languages);
    console.log('render: systemLang: ', systemLang);
    // let lang = req.cookies.language || systemLang;
    const envVars = {
        ...CLIENT_ENV,
        PLATFORM: 'browser',
        SYSTEM_LANG: systemLang,
    };
    const envVarsStr = sanitizeAndStringifyObj(envVars);

    const appStateStr = sanitizeAndStringifyObj(appState);

    const styleSheets = app.getStyleSheets();
    const styleSheetsStr = styleSheets.map(
        x => `<link rel="stylesheet" type="text/css" href="${x}" />`
    ).join('\n');

    const scripts = app.getScripts();
    const scriptsStr = scripts.map(
        x => `<script src="${x}"></script>`
    ).join('\n');

    const title = app.getTitle();
    const appStr = shouldRender ? app.render() : '';

    return (
        `<!doctype html>
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>${title}</title>
                ${styleSheetsStr}
            </head>
            <body>
                <div id="app-root">
                    ${appStr}
                </div>
                <script type="application/json" id="envVars">
                    ${envVarsStr}
                </script>
                <script type="application/json" id="appState">
                    ${appStateStr}
                </script>
                <script src="${PUBLIC_URL}commons.js"></script>
                ${scriptsStr}
            </body>
        </html>
        `
    );
}
