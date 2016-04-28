import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import { Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from '../reducers/reducers.js';

let initAppState = JSON.parse(document.getElementById('initAppState').innerHTML);

const store = createStore(combineReducers(reducers), initAppState);

import Routes from '../Routes.jsx';

var rootInstance = render((
    <Provider store={store}>
        <Router history={browserHistory}>
            {Routes}
        </Router>
    </Provider>
), document.getElementById('reactUI'));

if (module.hot) {
    require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
        getRootInstances: function () {
            // Help React Hot Loader figure out the root component instances on the page:
            return [rootInstance];
        }
    });
}
