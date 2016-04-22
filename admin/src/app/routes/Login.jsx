import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const LoginRoutes = (
    [
        <Route path="/lock" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./../pages/login/LockedScreen.jsx').default)
            })
        }} key={0} />,
        <Route path="/login" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./../pages/login/Login.jsx').default)
            })
        }} key={1} />,
        <Route path="/register" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./../pages/login/Register.jsx').default)
            })
        }} key={2} />,
        <Route path="/forgot" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./../pages/login/Forgot.jsx').default)
            })
        }} key={3} />
    ]
);

export default LoginRoutes;
