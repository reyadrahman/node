/* @flow */

import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import App from '../../front-end-framework/app.js';
import Component from '../../front-end-framework/component.js';
import { ENV as CLIENT_ENV } from '../../client-utils.js';
import DashboardPage from './components/dashboard-page.js';
import FlotPage from './components/flot-page.js';
import MorrisPage from './components/morris-page.js';
import TablesPage from './components/tables-page.js';
import FormsPage from './components/forms-page.js';
import PanelWellsPage from './components/panel-wells-page.js';
import ButtonsPage from './components/buttons-page.js';
import NotificationsPage from './components/notifications-page.js';
import TypographyPage from './components/typography-page.js';
import IconsPage from './components/icons-page.js';
import GridPage from './components/grid-page.js';
import BlankPage from './components/blank-page.js';
import Layout from './components/layout.js';
import Router from './components/router.js';

import type { AdminAppProps, Action } from './types.js';

import initSbAdmin2 from './sb-admin-2.js';

// Bootstrap Core CSS
import './public/vendor/bootstrap/css/bootstrap.css';
//MetisMenu CSS
import './public/vendor/metisMenu/metisMenu.css';
// Custom CSS
import './public/css/sb-admin-2.css';
// Morris Charts CSS
import './public/vendor/morrisjs/morris.css';
// Custom Fonts
import './public/vendor/font-awesome/css/font-awesome.css';
// DataTables CSS
import './public/vendor/datatables/datatables-plugins/dataTables.bootstrap.css';
// DataTables Responsive CSS
import './public/vendor/datatables-responsive/dataTables.responsive.css';
// Social Buttons CSS
import './public/vendor/bootstrap-social/bootstrap-social.css';

const { PUBLIC_URL } = CLIENT_ENV;

export default class Admin extends App<AdminAppProps> {
    // constructor() {
    // }

    componentDidMount() {
        console.log('Admin: componentDidMount()');
        super.componentDidMount();
        initSbAdmin2();
    }

    getScripts(): string[] {
        return [
            `${PUBLIC_URL}admin/vendor/jquery/jquery.min.js`,
            `${PUBLIC_URL}admin/vendor/bootstrap/js/bootstrap.min.js`,
            `${PUBLIC_URL}admin/vendor/metisMenu/metisMenu.min.js`,

            // dashboard
            `${PUBLIC_URL}admin/vendor/raphael/raphael.min.js`,
            `${PUBLIC_URL}admin/vendor/morrisjs/morris.min.js`,

            // flot
            `${PUBLIC_URL}admin/vendor/flot/excanvas.min.js`,
            `${PUBLIC_URL}admin/vendor/flot/jquery.flot.js`,
            `${PUBLIC_URL}admin/vendor/flot/jquery.flot.pie.js`,
            `${PUBLIC_URL}admin/vendor/flot/jquery.flot.resize.js`,
            `${PUBLIC_URL}admin/vendor/flot/jquery.flot.time.js`,
            `${PUBLIC_URL}admin/vendor/flot-tooltip/jquery.flot.tooltip.min.js`,

            // tables
            `${PUBLIC_URL}admin/vendor/datatables/js/jquery.dataTables.min.js`,
            `${PUBLIC_URL}admin/vendor/datatables/datatables-plugins/dataTables.bootstrap.min.js`,
            `${PUBLIC_URL}admin/vendor/datatables-responsive/dataTables.responsive.js`,

            `${PUBLIC_URL}admin.js`,
        ];
    }

    getStyleSheets(): string[] {
        return [
            `${PUBLIC_URL}admin.css`,
        ];
    }

    render() {
        // const state = this.props.stateCursor.get();

        this.unmountChildren();

        const router = this.addChild(new Router({
            ...this.props,
            stateCursor: new Cursor(this.props.stateCursor, 'location'),
        }, [
            [/^\/admin\/?$/, DashboardPage],
            [/^\/admin\/flot\/?$/, FlotPage],
            [/^\/admin\/morris\/?$/, MorrisPage],
            [/^\/admin\/tables\/?$/, TablesPage],
            [/^\/admin\/forms\/?$/, FormsPage],
            [/^\/admin\/panels-wells\/?$/, PanelWellsPage],
            [/^\/admin\/buttons\/?$/, ButtonsPage],
            [/^\/admin\/notifications\/?$/, NotificationsPage],
            [/^\/admin\/typography\/?$/, TypographyPage],
            [/^\/admin\/icons\/?$/, IconsPage],
            [/^\/admin\/grid\/?$/, GridPage],
            [/^\/admin\/blank\/?$/, BlankPage],
        ]), 'router');

        const layout = this.addChild(new Layout(this.props), 'layout');

        return layout.render({ contentComponent: router });
    }
}

