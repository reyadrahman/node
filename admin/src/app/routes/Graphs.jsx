import React from 'react';
import {Route, Redirect, IndexRoute} from 'react-router';

const GraphsRoutes = (
    [
        <Route path="flot" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/graphs/FlotCharts.jsx').default)
            })
        }} key={0} />,
        <Route path="easy-pie-charts" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/graphs/EasyPieCharts.jsx').default)
            })
        }} key={1} />,
        <Route path="sparklines" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/graphs/SparklineCharts.jsx').default)
            })
        }} key={2} />,
        <Route path="chartjs" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/graphs/ChartJs.jsx').default)
            })
        }} key={3} />,
        <Route path="dygraphs" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/graphs/Dygraphs.jsx').default)
            })
        }} key={4} />,
        <Route path="morris" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/graphs/MorrisCharts.jsx').default)
            })
        }} key={5} />,
        <Route path="highchart-table" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/graphs/HighchartTables.jsx').default)
            })
        }} key={6} />
    ]
);

export default GraphsRoutes;
