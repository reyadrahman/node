import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';
import Auth from '../auth';

const authNotRequiredPaths = [
    '/login', '/register', '/forgot', '/lock'
];

function pathRequiresAuth(path) {
    return !authNotRequiredPaths.includes(path);
}

function requireAuth(nextState, replace) {
    if (pathRequiresAuth(nextState.location.pathname)) {
        if (!Auth.isLoggedIn()) replace({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname }
        });
    }
    else if (Auth.isLoggedIn()) {
        replace({
            pathname: '/',
            state: { nextPathname: nextState.location.pathname }
        });
    }
}

function requireAuthOnChange(prevState, nextState, replace) {
    requireAuth(nextState, replace);
}

const Routes = (
    <Route onEnter={requireAuth} onChange={requireAuthOnChange}
        getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null,
                    (require('./Login.jsx').default)
                    .concat([require('./Main.jsx').default])
                )
            })
        }}>
    </Route>
);

export default Routes;