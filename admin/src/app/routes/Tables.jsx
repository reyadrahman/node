import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const TablesRoutes = (
    [
        <Route path="normal.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={0} />,
        <Route path="datatables" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/tables/Datatables.jsx').default)
            })
        }} key={1} />
    ]
);

export default TablesRoutes;
