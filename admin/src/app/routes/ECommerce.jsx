import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const ECommerceRoutes = (
    [
        <Route path="orders" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/e-commerce/Orders.jsx').default)
            })
        }} key={0} />,
        <Route path="products-view.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={1} subHeader={false} />,
        <Route path="products-detail.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={2} subHeader={false} />
    ]
);

export default ECommerceRoutes;
