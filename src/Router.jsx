import React from 'react'
import {render} from 'react-dom'
import {Router} from 'react-router'

import {hashHistory} from 'react-router'


import Routes from './Routes.jsx';

var rootInstance = render((
    <Router history={hashHistory}>
        {Routes}
    </Router>
), document.getElementById('reactUI'));

if (module.hot) {
    require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
        getRootInstances: function () {
            // Help React Hot Loader figure out the root component instances on the page:
            return [rootInstance];
        }
    });
}
