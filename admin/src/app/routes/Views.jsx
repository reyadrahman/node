import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const ViewsRoutes = (
    [
        <Route path="projects" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/app-views/Projects.jsx').default)
            })
        }} key={0} />,
        <Route path="blog.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={1} />,
        <Route path="timeline.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={2} />,
        <Route path="profile.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={3} />,
        <Route path="gallery" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/app-views/Gallery.jsx').default)
            })
        }} key={4} />,
        <Route path="forum" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={5} />,
        <Route path="general.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={6} />,
        <Route path="topic.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={7} />,
        <Route path="post.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={8} />
    ]
);

export default ViewsRoutes;
