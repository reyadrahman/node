import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const FormsRoutes = (
    [
        <Route path="elements" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/FormElements.jsx').default)
            })
        }} key={0} />,
        <Route path="layouts" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/FormLayouts.jsx').default)
            })
        }} key={1} />,
        <Route path="form-validation.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={2} />,
        <Route path="plugins" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/FormPlugins.jsx').default)
            })
        }} key={3} />,
        <Route path="wizards" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/Wizards.jsx').default)
            })
        }} key={4} />,
        <Route path="dropzone" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/DropzoneDemo.jsx').default)
            })
        }} key={5} />,
        <Route path="image-editor" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/ImageEditor.jsx').default)
            })
        }} key={6} />,
        <Route path="bootstrap-validation" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/BootstrapValidation.jsx').default)
            })
        }} key={7} />,
        <Route path="bootstrap-editors" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/forms/BootstrapEditors.jsx').default)
            })
        }} key={8} />,
        <Route path="bootstrap-form-elements.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} key={9} />
    ]
);

export default FormsRoutes;
