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
import {splitLangUrl, urlWithLang} from '../misc/url.js';
import acceptLanguage from 'accept-language';

acceptLanguage.languages(languages);

export default function render(req, res, next) {
    console.log('req.url: ', req.url);
    let systemLang = acceptLanguage.get(req.headers['accept-language']);

    let urlSplit = splitLangUrl(req.url);
    //let isLangInUrl = urlSplit && languages.includes(urlSplit.lang);
    let lang = urlSplit ? urlSplit.lang : systemLang;

    console.log('urlSplit', urlSplit, ', lang: ', lang);

    const store = createStore(combineReducers(reducers), {
        lang,
        systemLang,
        isLangInUrl: Boolean(urlSplit),
    });

    match({ routes: Routes, location: req.url }, (error, redirectLocation, renderProps) => {
        if (redirectLocation) {
            res.redirect(301, redirectLocation.pathname + redirectLocation.search)
        } else if (error) {
            next(error.message);
        } else if (renderProps == null) {
            next();
        } else {
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
    });
}
