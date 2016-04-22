import React from 'react'
import {Route, Redirect, IndexRoute} from 'react-router'

const MainRoutes = (
    <Route path="/" getComponent={(location, cb) => {
        require.ensure([], function (require) {
            cb(null, require('../pages/layout/Layout.jsx').default)
        })
    }}>
        <IndexRoute getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/app-views/Gallery.jsx').default)
            })
        }}/>
        <Route path="dashboard" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/dashboard/Dashboard.jsx').default)
            })
        }}/>
        <Route path="dashboard/social-wall.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            })
        }} subHeader={false}/>

        <Redirect from="inbox" to="/inbox/folder/inbox"/>
        <Route path="inbox" getComponent={(location, cb) => {
                require.ensure([], function (require) {
                    cb(null, require('../pages/inbox/components/Inbox.jsx').default)
                }) }}
            getChildRoutes={(location, cb) => {
                require.ensure([], function (require) {
                    cb(null, require('./Inbox.jsx').default)
                }) }}
        />

        <Redirect from="graphs" to="/graphs/chartjs"/>
        <Route path="graphs" getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./Graphs.jsx').default)
            }) }}
        />

        <Redirect from="tables" to="/tables/normal"/>
        <Route path="tables" getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./Tables.jsx').default)
            }) }}
        />

        <Redirect from="forms" to="/forms/elements"/>
        <Route path="forms" getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./Forms.jsx').default)
            }) }}
        />

        <Redirect from="ui" to="/ui/general"/>
        <Route path="ui" getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./UI.jsx').default)
            }) }}
        />

        <Route path="calendar" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/calendar/CalendarPage.jsx').default)
            }) }}
        />

        <Redirect from="maps" to="/maps/colorful"/>
        <Route path="maps" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/maps/Maps.jsx').default)
            }) }}>
            <Route path=":style" getComponent={(location, cb) => {
                require.ensure([], function (require) {
                    cb(null, require('../pages/maps/MapView.jsx').default)
                }) }}
            />
        </Route>

        <Route path="widgets" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/widgets/Widgets.jsx').default)
            }) }}
        />

        <Route path="views" getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./Views.jsx').default)
            }) }}
        />

        <Route path="misc" getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./Misc.jsx').default)
            }) }}
        />

        <Route path="e-commerce" getChildRoutes={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('./ECommerce.jsx').default)
            }) }}
        />

        <Route path="smartadmin/app-layouts.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            }) }} subHeader={false}
        />
        <Route path="smartadmin/skins.html" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/layout/tools/StaticPageLoader.jsx').default)
            }) }} subHeader={false}
        />
        <Route path="*" getComponent={(location, cb) => {
            require.ensure([], function (require) {
                cb(null, require('../pages/dashboard/Dashboard.jsx').default)
            }) }}
        />
    </Route>
);

export default MainRoutes;