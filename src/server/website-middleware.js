/* @flow */

import { languages } from '../client/i18n/translations.js';
import { ENV as CLIENT_ENV } from '../client/client-utils.js';
import LandingPage from '../client/apps/landing-page/landing-page.js';
import Admin from '../client/apps/admin/admin.js';
import initAdminAppState from '../client/apps/admin/init-app-state.js';
import EventSystem from '../client/front-end-framework/event-system.js';
import type App from '../client/front-end-framework/app.js';
import { Cursor } from '../misc/atom.js';
import { sanitizeAndStringifyObj } from './server-utils.js';
import express from 'express';
import type { Request, Response } from 'express';
import ice from 'icepick';
import { createMemoryHistory } from 'history';
import Route from 'route-parser';

const routes = express.Router();

const { PUBLIC_URL } = CLIENT_ENV;

export default function websiteMiddleware(req: Request, res: Response, next: Function) {
    let pathname = req.baseUrl + req.path;
    pathname = pathname.endsWith('/') && pathname !== '/'
        ? pathname.substr(0, pathname.length-1)
        : pathname;
    console.log('websiteMiddleware: req.baseUrl: ', req.baseUrl, ', req.path: ', req.path, ', pathname: ', pathname);
    const testRoutes = routes => routes
        .map(x => new Route(x[0]))
        .find(x => x.match(pathname))

    if (testRoutes(Admin.getRoutes())) {
        handleAdminApp(req, res, next, pathname);
    } else if (testRoutes(LandingPage.getRoutes())) {
        handleLandingPageApp(req, res, next, pathname);
    } else {
        next();
    }
}

function handleLandingPageApp(req: Request, res: Response, next: Function, pathname: string) {
    const state = {
        currentUser: {
            signedIn: req.cookies.signedIn,
            attributes: {}, // will be filled by the client
        }
    };
    const context = {
        stateCursor: new Cursor(state),
        // TODO use a mock EventSystem
        eventSystem: new EventSystem(),
        // mock dispatchAction
        dispatchAction: action => Promise.resolve(),
        history: createMemoryHistory({
            initialEntries: [ pathname ],
        }),
    };

    const app = new LandingPage(context);
    handleCommon(app, !req.cookies.signedIn, req, res, context.stateCursor.get());
    // handleCommon(app, false, req, res, {});
}

function handleAdminApp(req: Request, res: Response, next: Function, pathname: string) {
    const context = {
        stateCursor: new Cursor(initAdminAppState),
        // TODO use a mock EventSystem
        eventSystem: new EventSystem(),
        // mock dispatchAction
        dispatchAction: action => Promise.resolve(),
        // mock history
        history: createMemoryHistory({
            initialEntries: [ pathname ],
        }),
    };

    const app = new Admin(context);
    handleCommon(app, false, req, res, {});
}

function handleCommon(app: App<*, *>, shouldRender, req, res, appState) {

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
    const styleSheets = app.constructor.getStyleSheets();
    const styleSheetsStr = styleSheets.map(
        x => `<link rel="stylesheet" type="text/css" href="${x}" />`
    ).join('\n');
    const scripts = app.constructor.getScripts();
    const scriptsStr = scripts.map(
        x => `<script src="${x}"></script>`
    ).join('\n');
    const title = app.constructor.getTitle();
    const appStr = shouldRender ? app.render() : '';

    res.send(
        `<!doctype html>
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>${title}</title>
                ${styleSheetsStr}
            </head>
            <body>
                <div id="app-root">${appStr}</div>
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
