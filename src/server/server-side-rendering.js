import Html from '../components/html/Html.jsx';
import * as reducers from '../reducers/reducers.js';
import Routes from '../Routes.jsx';
import { languages } from '../i18n/translations.js';
import { ENV as CLIENT_ENV } from '../client/client-utils.js';
import acceptLanguage from 'accept-language';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { RouterContext, match } from 'react-router';

acceptLanguage.languages(languages);

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
                ...CLIENT_ENV,
                PLATFORM: 'browser',
            };
            if (full) {
                renderFull(req, res, next, renderProps, envVars);
            } else {
                renderTemplate(req, res, next, envVars);
            }
        }
    });
}

function renderTemplate(req, res, next, envVars) {
    const systemLang = acceptLanguage.get(req.headers['accept-language']);

    if (templateCache[systemLang]) {
        console.log('serving template from cache');
        res.status(200).send(templateCache[systemLang]);

    } else {
        console.log('rendering template.');
        const initAppState = { systemLang };
        const store = createStore(combineReducers(reducers), initAppState);

        const html = ReactDOM.renderToStaticMarkup(
            <Html
                body=""
                initAppState={store.getState()}
                envVars={envVars}
            />
        );
        const doc = '<!doctype html>\n' + html;
        templateCache[systemLang] = doc;
        res.status(200).send(doc);
    }
}

function renderFull(req, res, next, renderProps, envVars) {
    console.log('renderFull. req.url: ', req.url, 'req.cookies: ', req.cookies);
    let systemLang = acceptLanguage.get(req.headers['accept-language']);
    let lang = req.cookies.language || systemLang;

    const initAppState = { lang, systemLang };
    const store = createStore(combineReducers(reducers), initAppState,
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
