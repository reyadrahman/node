import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const InboxRoutes = (
    [
        <Route path="folder/:folder" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/inbox/components/InboxFolder.jsx').default)
            })
        }} key={0} />,
        <Route path="compose" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/inbox/components/InboxCompose.jsx').default)
            })
        }} key={1} />,
        <Route path="detail/:messageId" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/inbox/components/InboxDetail.jsx').default)
            })
        }} key={2} />,
        <Route path="replay/:messageId" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/inbox/components/InboxReplay.jsx').default)
            })
        }} key={3} />
    ]
);

export default InboxRoutes;
