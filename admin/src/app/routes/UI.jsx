import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const UIRoutes = (
    [
        <Route path="general" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/ui/UiGeneral.jsx').default)
            })
        }} key={0} />,
        <Route path="buttons.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={1} />,
        <Route path="icons" key={2}>
            <Route path="font-awesome" getComponent={(location, cb) => {
                require.ensure([], function (require) {
                    cb(null, require('../pages/ui/icons/FontAwesomeIcons.jsx').default)
                })
            }}/>
            <Route path="glyphicons" getComponent={(location, cb) => {
                require.ensure([], function (require) {
                    cb(null, require('../pages/ui/icons/Glyphicons.jsx').default)
                })
            }}/>
            <Route path="flags" getComponent={(location, cb) => {
                require.ensure([], function (require) {
                    cb(null, require('../pages/ui/icons/FlagIcons.jsx').default)
                })
            }}/>
        </Route>,
        <Route path="jquery-ui" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/ui/JQueryUi.jsx').default)
            })
        }} key={3} />,
        <Route path="tree-view" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/ui/TreeViews.jsx').default)
            })
        }} key={4} />,
        <Route path="nestable-lists" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/ui/NestableLists.jsx').default)
            })
        }} key={5} />,
        <Route path="grid.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={6} />,
        <Route path="typography.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={7} />
    ]
);

export default UIRoutes;
