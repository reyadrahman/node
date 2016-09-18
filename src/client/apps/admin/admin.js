/* @flow */

import EventSystem from '../../front-end-framework/event-system.js';
import { Cursor } from '../../../misc/atom.js';
import App from '../../front-end-framework/app.js';
import Component from '../../front-end-framework/component.js';
import { ENV as CLIENT_ENV } from '../../client-utils.js';
import TestPage from './components/test-page.js';
import FlotPage from './components/flot-page.js';
import MorrisPage from './components/morris-page.js';
import TablesPage from './components/tables-page.js';
import FormsPage from './components/forms-page.js';
import AccountPage from './components/account-page.js';
import ButtonsPage from './components/buttons-page.js';
import NotificationsPage from './components/notifications-page.js';
import TypographyPage from './components/typography-page.js';
import IconsPage from './components/icons-page.js';
import GridPage from './components/grid-page.js';
import BlankPage from './components/blank-page.js';
import MessagesPage from './components/messages-page.js';
import FeedsPage from './components/feeds-page.js';
import Layout from './components/layout.js';
import Router from './components/router.js';

import type { AdminAppContext, Action } from './types.js';

// Bootstrap Core CSS
import './public/vendor/bootstrap/css/bootstrap.css';
//MetisMenu CSS
import './public/vendor/metisMenu/metisMenu.css';
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


// Custom CSS
import './less/sb-admin-2.less';

const { PUBLIC_URL } = CLIENT_ENV;

export default class Admin extends App<AdminAppContext, null> {
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

    componentDidMount() {
        console.log('Admin: componentDidMount()');
        super.componentDidMount();

        $('#side-menu').metisMenu();
        this.onMountAndResize();
        $(window).bind("resize", () => this.onMountAndResize());

        // var url = window.location;
        // var element = $('ul.nav a').filter(function() {
        //     return this.href == url;
        // }).addClass('active').parent().parent().addClass('in').parent();
        // var element = $('ul.nav a').filter(function() {
        //     return this.href == url;
        // }).addClass('active').parent();

        // while (true) {
        //     if (element.is('li')) {
        //         element = element.parent().addClass('in').parent();
        //     } else {
        //         break;
        //     }
        // }
    }

    onMountAndResize() {
        // Loads the correct sidebar on window load,
        // collapses the sidebar on window resize.
        // Sets the min-height of .set-min-height-for-page-wrapper to window size

        var topOffset = 50;
        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((window.innerHeight > 0) ? window.innerHeight : screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $(".set-min-height-for-page-wrapper").css("min-height", (height) + "px");
        }
    }

    render() {
        const state = this.context.stateCursor.get();
        if (!state.currentUser.signedIn) {
            return '';
        }

        this.unmountChildren();

        const router = this.addChild(new Router(this.context, {
            routes: [
                [ '/admin',                            TestPage ],
                [ '/admin/test',                            TestPage ],
                [ '/admin/messages(/:conversationId)', MessagesPage ],
                [ '/admin/feeds',                      FeedsPage ],
                [ '/admin/flot',                       FlotPage ],
                [ '/admin/morris',                     MorrisPage ],
                [ '/admin/tables',                     TablesPage ],
                [ '/admin/forms',                      FormsPage ],
                [ '/admin/account',               AccountPage ],
                [ '/admin/buttons',                    ButtonsPage ],
                [ '/admin/notifications',              NotificationsPage ],
                [ '/admin/typography',                 TypographyPage ],
                [ '/admin/icons',                      IconsPage ],
                [ '/admin/grid',                       GridPage ],
                [ '/admin/blank',                      BlankPage ],
            ],
        }), 'router');

        const layout = this.addChild(new Layout(this.context, {
            contentComponent: router,
        }), 'layout');

        return layout.render();
    }
}

