import * as actions from '../app-state/actions.js';
import * as aws from '../aws/aws.js';
import initAppState from '../app-state/init-app-state.js'
import Routes from '../Routes.jsx';
import { languages } from '../i18n/translations.js';
import * as reducers from '../app-state/reducers.js';
import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory, applyRouterMiddleware } from 'react-router'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import Cookies from 'js-cookie';
import _ from 'lodash';

const initAppStateFromServer = JSON.parse(document.getElementById('initAppState').innerHTML);
const systemLang = document.getElementsByTagName('body')[0].dataset.systemLang;
console.log('systemLang: ', systemLang);

const loggerMiddleware = createLogger();


let initAndRender = userAttributes => {
    let appState = _.isEmpty(initAppStateFromServer) ? initAppState : initAppStateFromServer;

    if (!appState.lang) {
        appState = {
            ...appState,
            lang: Cookies.get('language') || systemLang || languages[0],
        };
    }

    const store = createStore(combineReducers(reducers),
                              appState,
                              applyMiddleware(
                                  thunkMiddleware,
                                  loggerMiddleware));

    if (userAttributes) {
        store.dispatch({ type: 'currentUser/signIn', attributes: userAttributes });
    }

    const extraProps = {
        setPageTitle(title) {
            document.title = title;
        }
    };
    const useExtraProps = {
        renderRouteComponent: child => React.cloneElement(child, extraProps)
    };

    render((
        <Provider store={store}>
            <Router
                history={browserHistory}
                render={applyRouterMiddleware(useExtraProps)}
            >
                {Routes}
            </Router>
        </Provider>
    ), document.getElementById('reactUI'));
}

aws.getCurrentUserAttributes()
   .then(attrs => {
       console.log('client-router: gotAttributes: ', attrs);
       initAndRender(attrs);
   })
   .catch(err => {
       console.log('client-router: ', err);
       initAndRender();
   });
