import * as actions from '../../app-state/actions.js';
import Header from '../header/Header.jsx';
import Menu from '../home/Menu.jsx';

import React from 'react';
import { Dropdown, MenuItem, ButtonGroup, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import _ from 'lodash';


let SignedInPage = React.createClass({
    componentDidMount() {
        if (!this.props.currentUser.signedIn) {
            this.props.openSignIn();
            return;
        }

        this.props.fetchBots();
    },

    componentDidUpdate(oldProps) {
        // if signed out
        if (oldProps.currentUser.signedIn && !this.props.currentUser.signedIn) {
            this.props.openSignIn();
        }

        // if signed in
        if (!oldProps.currentUser.signedIn && this.props.currentUser.signedIn) {
            this.props.fetchBots();
        }
    },

    onMenuToggle() {
        this.props.toggleSideMenu();
    },

    onBotSelect(eventKey) {
        if (eventKey === 'add-new') {
            this.props.router.push('/add-bot');
        } else {
            this.props.selectBot(eventKey);
        }
    },

    onNewBot() {
        this.props.router.push('/add-bot')
    },

    render() {
        const { className, children, currentUser, ui, location, i18n,
                i18n: { strings: { signedInPage: strings } },
        } = this.props;

        let cs;
        if (currentUser.signedIn) {
            cs = React.cloneElement(children, {
                i18n,
                className: `signed-in-page-content ${ui.sideMenu ? 'side-menu-open' : ''}`,
            });
        } else  {
            cs = (
                <h1 className={`${className || ''} please-sign-in`}>
                    {strings.pleaseSignIn}
                </h1>
            );
        }

        const sideMenuStrings = i18n.strings.sideMenu;
        const menu = [
            {
                string: sideMenuStrings.test,
                to: '/test',
                glyph: 'play',
                value: 'test',
            },
            {
                string: sideMenuStrings.settings,
                to: '/settings',
                glyph: 'cog',
                value: 'settings',
            },
            {
                string: sideMenuStrings.users,
                to: '/users',
                glyph: 'users',
                value: 'users',
            },
            {
                string: sideMenuStrings.transcripts,
                to: '/transcripts',
                glyph: 'comment',
                value: 'transcripts',
            },
            {
                string: sideMenuStrings.tracking,
                to: '/tracking',
                glyph: 'signal',
                value: 'tracking',
            },
            {
                string: sideMenuStrings.polls,
                to:     '/polls',
                glyph:   'thumbs-up',
                value:  'polls',
            },
            {
                string: sideMenuStrings.feeds,
                to: '/feeds',
                glyph: 'rss',
                value: 'feeds',
            },
            {
                string: sideMenuStrings.notifications,
                to: '/notifications',
                glyph: 'bell',
                value: 'notifications',
            },
        ];

        const menuToggle = (
            <i  className="menu-toggle fa fa-bars"
                onClick={this.onMenuToggle}
                onMouseEnter={this.onMenuToggleEnter}
                onMouseLeave={this.onMenuToggleLeave}
            ></i>
        );

        const { selectedBotId, botsState: { bots, hasFetched } } = currentUser;
        const selectedBot = bots.find(x => x.botId === selectedBotId);

        let botSelector;
        if (!hasFetched) {
            botSelector = <div className="bot-selector-fetching">{strings.fetchingBots}</div>;
        } else if (_.isEmpty(bots)) {
            botSelector = (
                <Button
                    onClick={this.onNewBot}
                    className="bot-selector-new-bot"
                >
                    {strings.newBot}
                </Button>
            );
        } else {
            botSelector = (
                <Dropdown
                    className="bot-selector-dropdown"
                    disabled={!selectedBot}
                    onSelect={this.onBotSelect}
                >
                    <Dropdown.Toggle>
                        { selectedBot.botName }
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {
                            currentUser.botsState.bots.map(
                                x => <MenuItem eventKey={x.botId}>{x.botName}</MenuItem>
                            )
                        }
                        <MenuItem divider />
                        <MenuItem eventKey="add-new">{strings.newBot}</MenuItem>
                    </Dropdown.Menu>
                </Dropdown>
            );
        }

        return (
            <div className={`${className || ''} signed-in-page-comp`}>
                <Header
                    className="header" i18n={i18n}
                    leftItemsBeforeLogo = {[
                        <Menu className="signed-in" i18n={i18n} menu={menu} />
                    ]}
                    leftItemsAfterLogo={botSelector}
                />
            { cs }
            </div>
        );
    }
});

SignedInPage = connect(
    state => ({
        currentUser: state.currentUser,
        ui: state.ui,
    }),
    {
        openSignIn: actions.openSignIn,
        toggleSideMenu: actions.toggleSideMenu,
        fetchBots: actions.fetchBots,
        selectBot: actions.selectBot,
    }
)(SignedInPage);

SignedInPage = withRouter(SignedInPage);

export default SignedInPage;
