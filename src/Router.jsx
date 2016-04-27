import React from 'react'
import {render} from 'react-dom'
import {Router, hashHistory} from 'react-router'
import { Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from './reducers/reducers.js';

const store = createStore(combineReducers(reducers));

import Routes from './Routes.jsx';

var rootInstance = render((
    <Provider store={store}>
        <Router history={hashHistory}>
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
