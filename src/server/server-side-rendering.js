import React from 'react';
import ReactDOM from 'react-dom/server';
import {Router, RouterContext, match, createMemoryHistory} from 'react-router';
import Html from '../components/html/Html.jsx';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import * as reducers from '../reducers/reducers.js';
import Routes from '../Routes.jsx';
import App from '../components/app/App.jsx';
import Home from '../components/home/Home.jsx';
import {languages} from '../i18n/translations.js';
import acceptLanguage from 'accept-language';

acceptLanguage.languages(languages);

// cache by systemLang
const templateCache = {};

export default function render(full, req, res, next) {
    match({ routes: Routes, location: req.url }, (error, redirectLocation, renderProps) => {
        if (redirectLocation) {
            res.redirect(301, redirectLocation.pathname + redirectLocation.search)
        } else if (error) {
            next(error.message);
        } else if (renderProps == null) {
            next();
        } else {
            if (full) {
                renderFull(req, res, next, renderProps);
            } else {
                renderTemplate(req, res, next);
            }
        }
    });

}

function renderTemplate(req, res, next) {
    let systemLang = acceptLanguage.get(req.headers['accept-language']);

    if (templateCache[systemLang]) {
        console.log('serving template from cache');
        res.status(200).send(templateCache[systemLang]);

    } else {
        console.log('rendering template');
        const store = createStore(combineReducers(reducers), {
            systemLang,
        });

        let html = ReactDOM.renderToStaticMarkup(
            <Html
                body=""
                initAppState={store.getState()}
            />
        );
        let doc = '<!doctype html>\n' + html;
        templateCache[systemLang] = doc;
        res.status(200).send(doc);
    }
}

function renderFull(req, res, next, renderProps) {
    console.log('renderFull. req.url: ', req.url, 'req.cookies: ', req.cookies);
    let systemLang = acceptLanguage.get(req.headers['accept-language']);
    let lang = req.cookies.language || systemLang;

    const store = createStore(combineReducers(reducers), {
        lang,
        systemLang,
    });


    let body = ReactDOM.renderToString(
        <Provider store={store}>
            <RouterContext {...renderProps} />
        </Provider>
    );
    let html = ReactDOM.renderToStaticMarkup(
        <Html
            body={body}
            initAppState={store.getState()}
        />
    );
    let doc = '<!doctype html>\n' + html;

    res.status(200).send(doc);
}
