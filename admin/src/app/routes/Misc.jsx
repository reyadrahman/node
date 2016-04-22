import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const MiscRoutes = (
    [
        <Route path="pricing-tables.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={0} />,
        <Route path="invoice.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={1} />,
        <Route path="search.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={2} />,
        <Route path="email-template.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={3} />,
        <Route path="404" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/misc/Page404.jsx').default)
            })
        }} key={4} />,
        <Route path="500" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/misc/Page500.jsx').default)
            })
        }} key={5} />,
        <Route path="blank" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/misc/BlankPage.jsx').default)
            })
        }} key={6} />,
        <Route path="ck-editor" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/misc/CKEditorDemo.jsx').default)
            })
        }} key={7} />
    ]
);

export default MiscRoutes;
