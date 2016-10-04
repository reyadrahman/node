import Html from '../components/html/Html.jsx';
import Routes from '../Routes.jsx';
import { languages } from '../i18n/translations.js';
import { CONSTANTS_KEYS as CLIENT_CONSTANTS_KEYS } from '../client/client-utils.js';
import { CONSTANTS } from './server-utils.js'
import initAppState from '../app-state/init-app-state.js';
import * as reducers from '../app-state/reducers.js';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import _ from 'lodash';


const loggerMiddleware = createLogger();

// cache by systemLang
const templateCache = {};

export default function render(full, req, res, next) {
    match({ routes: Routes, location: req.url }, (error, redirectLocation, renderProps) => {
        if (redirectLocation) {
            res.redirect(301, redirectLocation.pathname + redirectLocation.search)
        } else if (error) {
            next(error);
        } else if (renderProps == null) {
            next();
        } else {
            const envVars = {
                ...(_.pick(CONSTANTS, CLIENT_CONSTANTS_KEYS)),
                PLATFORM: 'browser',
            };
            const systemLang = req.acceptsLanguages(...languages);
            console.log('systemLang: ', systemLang);
            if (full) {
                renderFull(req, res, next, renderProps, envVars, systemLang);
            } else {
                renderTemplate(req, res, next, envVars, systemLang);
            }
        }
    });
}

function renderTemplate(req, res, next, envVars, systemLang) {

    if (templateCache[systemLang]) {
        console.log('serving template from cache');
        res.status(200).send(templateCache[systemLang]);

    } else {
        console.log('rendering template.');
        const html = ReactDOM.renderToStaticMarkup(
            <Html
                body=""
                initAppState={{}}
                envVars={envVars}
                systemLang={systemLang}
            />
        );
        const doc = '<!doctype html>\n' + html;
        templateCache[systemLang] = doc;
        res.status(200).send(doc);
    }
}

function renderFull(req, res, next, renderProps, envVars, systemLang) {
    console.log('renderFull. req.url: ', req.url, 'req.cookies: ', req.cookies);
    let lang = req.cookies.language || systemLang;
    const appState = {
        ...initAppState,
        lang,
    };

    const store = createStore(combineReducers(reducers),
                              appState,
                              applyMiddleware(
                                  thunkMiddleware,
                                  loggerMiddleware));

    console.log('renderFull renderProps: ', renderProps);

    const renderFullHelper = () => {
        let body = ReactDOM.renderToString(
            <Provider store={store}>
                <RouterContext {...renderProps} />
            </Provider>
        );
        let html = ReactDOM.renderToStaticMarkup(
            <Html
                body={body}
                initAppState={store.getState()}
                envVars={envVars}
                systemLang={systemLang}
            />
        );
        let doc = '<!doctype html>\n' + html;

        res.status(200).send(doc);
    };

    const comp = renderProps.components[renderProps.components.length-1];
    if (!comp.fetchData) {
        return renderFullHelper();
    }

    comp.fetchData({
        params: renderProps.params,
        history: renderProps.history,
        store,
    }).then(renderFullHelper).catch(renderFullHelper);
}
