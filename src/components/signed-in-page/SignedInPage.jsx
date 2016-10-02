import * as actions from '../../app-state/actions.js';
import Header from '../header/Header.jsx';
import SideMenu from '../side-menu/SideMenu.jsx';

import React from 'react';
import { Glyphicon, Dropdown, MenuItem, ButtonGroup, Button } from 'react-bootstrap';
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

        console.log('SignedInPage: props', this.props);
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
                label: sideMenuStrings.account,
                link: '/account',
                glyph: 'user',
                value: 'account',
            },
            {
                label: sideMenuStrings.users,
                link: '/users',
                icon: 'icon-users',
                value: 'users',
            },
            {
                label: sideMenuStrings.messages,
                link: '/messages',
                glyph: 'comment',
                value: 'messages',
            },
            {
                label: sideMenuStrings.feeds,
                link: '/feeds',
                glyph: 'comment',
                value: 'feeds',
            },
            {
                label: sideMenuStrings.notifications,
                link: '/notifications',
                glyph: 'comment',
                value: 'notifications',
            },
        ];

        const menuToggle = (
            <Glyphicon
                glyph="menu-hamburger"
                className={`menu-toggle ${ui.sideMenu ? 'open' : ''}`}
                onClick={this.onMenuToggle}
            />
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
                    leftItemsBeforeLogo={menuToggle}
                    leftItemsAfterLogo={botSelector}
                />
                <SideMenu
                    i18n={i18n} menu={menu}
                    value={location.pathname.split('/')[1] || ''}
                    isOpen={ui.sideMenu}
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
