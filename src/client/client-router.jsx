import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import {Provider} from 'react-redux'
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import * as reducers from '../reducers/reducers.js';
import * as actions from '../actions/actions.js';
import * as aws from '../aws/aws.js';
import Routes from '../Routes.jsx';

const initAppState = JSON.parse(document.getElementById('initAppState').innerHTML);

const loggerMiddleware = createLogger();


let initAndRender = currentUser => {
    if (!initAppState.lang) {
        initAppState.lang = initAppState.systemLang;
    }

    const store = createStore(combineReducers(reducers), initAppState,
                              applyMiddleware(
                                  thunkMiddleware,
                                  loggerMiddleware));

    if (currentUser) {
        store.dispatch(actions.setCurrentUserAttributes(currentUser));
    }

    render((
        <Provider store={store}>
            <Router history={browserHistory}>
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
       console.log('client-router: ERROR: ', err);
       initAndRender();
   });


/*
if (module.hot) {
    require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
        getRootInstances: function () {
            // Help React Hot Loader figure out the root component instances on the page:
            return [rootInstance];
        }
    });
}
*/
