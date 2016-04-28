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
import acceptLanguage from 'accept-language';

acceptLanguage.languages(['en', 'fr']);

export default function render(req, res, next) {
    //console.log(req);
    let langCode = acceptLanguage.get(req.headers['accept-language']);
    let lang = langCode === 'fr' ? 'french' : 'english';
    const store = createStore(combineReducers(reducers), {lang});

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
