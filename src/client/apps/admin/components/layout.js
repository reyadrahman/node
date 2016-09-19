/* @flow */

import Component from '../../../front-end-framework/app.js';
import * as actions from '../actions';
import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';

import isEmpty from 'lodash/isEmpty';


type Props = {
    contentComponent: Component<AdminAppContext, *>;
};


export default class Layout extends Component<AdminAppContext, Props> {
    componentDidMount() {
        this.context.dispatchAction(actions.fetchBots());
        this.context.eventSystem.subscribe(() => this.rerenderBotsUi(), ['fetchedBots', 'selectedBot']);

        const self = this;
        $('#signOutButton').click(() => this.signOut());
        $(document).on('click', '#headerBotsUi a', function() {
            const botId = $(this).data('bot-id');
            if (botId) {
                self.context.dispatchAction(actions.selectBot(botId));
            }
            return false;
        })
    }

    rerenderBotsUi() {
        $('#headerBotsUi').replaceWith(this.renderBotsUi());
    }

    renderBotsUi() {
        const { botsState, selectedBotId } = this.context.stateCursor.get().currentUser;

        if (!botsState.hasFetched) {
            return `
                <li class="dropdown disabled" id="headerBotsUi">
                    <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Fetching bots... <span class="caret"></span></a>
                </li>
            `;
        }

        if (isEmpty(botsState.bots)) {
            return `
                <li id="headerBotsUi">
                    <a href="javascript:void(0)">Add a new bot</a>
                </li>
            `;
        }

        const botListUi = botsState.bots.map(
            b => `<li><a href="javascript:void(0)" data-bot-id="${b.botId}">${b.botName}</a></li>`
        ).join('\n');
        const selectedBot = botsState.bots.find(x => x.botId === selectedBotId);

        return `
            <li class="dropdown" id="headerBotsUi">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    ${selectedBot.botName} <span class="caret"></span>
                </a>
                <ul class="dropdown-menu" >
                    ${ botListUi }
                    <li role="separator" class="divider"></li>
                    <li><a href="javascript:void(0)">Add a new bot</a></li>
                </ul>
            </li>
        `;
    }

    signOut() {
        this.context.dispatchAction(actions.signOut());
    }

    render() {
        console.log('Layout render');
        const { contentComponent } = this.props;
        // const state = this.props.stateCursor.get();

        const botsUi = this.renderBotsUi();

        return (`
            <div id="layout-root">

                <!-- Navigation -->
                <nav class="navbar navbar-default navbar-static-top" role="navigation" style="margin-bottom: 0">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                            <span class="sr-only">Toggle navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </button>
                        <a class="navbar-brand" href="/">Deepiks</a>
                    </div>
                    <!-- /.navbar-header -->
                    <ul class="nav navbar-nav">
                        ${ botsUi }
                    </ul>
                    <ul class="nav navbar-top-links navbar-right">
                        <li class="dropdown">
                            <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                <i class="fa fa-user fa-fw"></i> <i class="fa fa-caret-down"></i>
                            </a>
                            <ul class="dropdown-menu dropdown-user">
                                <li><a class="dynamic-link" href="/admin/account"><i class="fa fa-user fa-fw"></i> Account</a>
                                </li>
                                <li class="divider"></li>
                                <li><a href="javascript:void(0)" id="signOutButton"><i class="fa fa-sign-out fa-fw"></i> Sign out</a>
                                </li>
                            </ul>
                            <!-- /.dropdown-user -->
                        </li>
                        <!-- /.dropdown -->
                    </ul>
                    <!-- /.navbar-top-links -->

                    <div class="navbar-default sidebar" role="navigation">
                        <div class="sidebar-nav navbar-collapse">
                            <ul class="nav" id="side-menu">
                                <li class="sidebar-search">
                                    <div class="input-group custom-search-form">
                                        <input type="text" class="form-control" placeholder="Search...">
                                        <span class="input-group-btn">
                                            <button class="btn btn-default" type="button">
                                                <i class="fa fa-search"></i>
                                            </button>
                                        </span>
                                    </div>
                                    <!-- /input-group -->
                                </li>
                                <li>
                                    <a class="dynamic-link" href="/admin/test"><i class="fa fa-play-circle fa-fw"></i> Test</a>
                                </li>
                                <li>
                                    <a class="dynamic-link" href="/admin/messages"><i class="fa fa-envelope fa-fw"></i> Messages</a>
                                </li>
                                <li>
                                    <a class="dynamic-link" href="/admin/feeds"><i class="fa fa-rss fa-fw"></i> Feeds</a>
                                </li>
                                <li>
                                    <a class="dynamic-link" href="/admin/test"><i class="fa fa-play-circle fa-fw"></i> Test</a>
                                </li>
                                <li>
                                    <a href="#"><i class="fa fa-bar-chart-o fa-fw"></i> Charts<span class="fa arrow"></span></a>
                                    <ul class="nav nav-second-level">
                                        <li>
                                            <a class="dynamic-link" href="/admin/flot">Flot Charts</a>
                                        </li>
                                        <li>
                                            <a class="dynamic-link" href="/admin/morris">Morris.js Charts</a>
                                        </li>
                                    </ul>
                                    <!-- /.nav-second-level -->
                                </li>
                                <li>
                                    <a class="dynamic-link" href="/admin/tables"><i class="fa fa-table fa-fw"></i> Tables</a>
                                </li>
                                <li>
                                    <a class="dynamic-link" href="/admin/forms"><i class="fa fa-edit fa-fw"></i> Forms</a>
                                </li>
                                <li>
                                    <a href="#"><i class="fa fa-wrench fa-fw"></i> UI Elements<span class="fa arrow"></span></a>
                                    <ul class="nav nav-second-level">
                                        <li>
                                            <a class="dynamic-link" href="/admin/panels-wells">Panels and Wells</a>
                                        </li>
                                        <li>
                                            <a class="dynamic-link" href="/admin/buttons">Buttons</a>
                                        </li>
                                        <li>
                                            <a class="dynamic-link" href="/admin/notifications">Notifications</a>
                                        </li>
                                        <li>
                                            <a class="dynamic-link" href="/admin/typography">Typography</a>
                                        </li>
                                        <li>
                                            <a class="dynamic-link" href="/admin/icons"> Icons</a>
                                        </li>
                                        <li>
                                            <a class="dynamic-link" href="/admin/grid">Grid</a>
                                        </li>
                                    </ul>
                                    <!-- /.nav-second-level -->
                                </li>
                                <li>
                                    <a href="#"><i class="fa fa-sitemap fa-fw"></i> Multi-Level Dropdown<span class="fa arrow"></span></a>
                                    <ul class="nav nav-second-level">
                                        <li>
                                            <a href="#">Second Level Item</a>
                                        </li>
                                        <li>
                                            <a href="#">Second Level Item</a>
                                        </li>
                                        <li>
                                            <a href="#">Third Level <span class="fa arrow"></span></a>
                                            <ul class="nav nav-third-level">
                                                <li>
                                                    <a href="#">Third Level Item</a>
                                                </li>
                                                <li>
                                                    <a href="#">Third Level Item</a>
                                                </li>
                                                <li>
                                                    <a href="#">Third Level Item</a>
                                                </li>
                                                <li>
                                                    <a href="#">Third Level Item</a>
                                                </li>
                                            </ul>
                                            <!-- /.nav-third-level -->
                                        </li>
                                    </ul>
                                    <!-- /.nav-second-level -->
                                </li>
                                <li class="active">
                                    <a href="#"><i class="fa fa-files-o fa-fw"></i> Sample Pages<span class="fa arrow"></span></a>
                                    <ul class="nav nav-second-level">
                                        <li>
                                            <a class="active dynamic-link" href="/admin/blank">Blank Page</a>
                                        </li>
                                        <li>
                                            <a class="dynamic-link" href="login.html">Login Page</a>
                                        </li>
                                    </ul>
                                    <!-- /.nav-second-level -->
                                </li>
                            </ul>
                        </div>
                        <!-- /.sidebar-collapse -->
                    </div>
                    <!-- /.navbar-static-side -->
                </nav>

                <!-- Page Content -->
                <div class="set-min-height-for-page-wrapper">
                    ${ contentComponent.render() }
                </div>

            </div>
        `);
    }
}

