import React from 'react'
import {render} from 'react-dom'
import {Router, browserHistory} from 'react-router'
import { Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import * as reducers from '../reducers/reducers.js';
import * as actions from '../actions/actions.js';

let initAppState = JSON.parse(document.getElementById('initAppState').innerHTML);

const store = createStore(combineReducers(reducers), initAppState);

import Routes from '../Routes.jsx';

/*
// TODO take this out of here
const languages = ['en', 'fr'];

browserHistory.listen(location => {
    console.log('location: ', location);

    let state = store.getState();
    let langInUrlMatch = location.pathname.match(/^\/?(\w+)($|\/|\?|#)/);
    if (!state.isLangInUrl && !langInUrlMatch) return;

    let validLangInUrl = langInUrlMatch && languages.includes(langInUrlMatch[1]);
    if (langInUrlMatch && validLangInUrl) {
        store.dispatch(actions.changeLang(langInUrlMatch[1]));
        store.dispatch(actions.changeIsLangInUrl(true));
    } else {
        store.dispatch(actions.changeLang(state.systemLang));
        store.dispatch(actions.changeIsLangInUrl(false));
    }

});
*/

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
