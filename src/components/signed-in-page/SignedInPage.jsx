import * as actions from '../../actions/actions.js';
import Header from '../header/Header.jsx';
import SideMenu from '../side-menu/SideMenu.jsx';

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';


let SignedInPage = React.createClass({
    isSignedIn(props) {
        const { currentUser } = props || this.props;
        return currentUser && currentUser.attributes && currentUser.attributes.sub;
    },

    componentDidMount() {
        if (!this.isSignedIn()) {
            // this.props.router.push('/');
            this.props.openSignIn();
        }
    },

    componentDidUpdate(oldProps) {
        if (this.isSignedIn(oldProps) && !this.isSignedIn()) {
            // this.props.router.push('/');
            this.props.openSignIn();
        }
    },

    onMenuToggle() {
        this.props.toggleSideMenu();
    },

    render() {
        const { className, children, currentUser, ui, location, i18n,
                i18n: { strings: { signedInPage: strings } },
        } = this.props;

        console.log('SignedInPage: props', this.props);
        let cs;
        if (this.isSignedIn()) {
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
                icon: 'user',
                value: 'account',
            },
            {
                label: sideMenuStrings.messages,
                link: '/messages',
                icon: 'comment',
                value: 'messages',
            },
            {
                label: sideMenuStrings.notifications,
                link: '/notifications',
                icon: 'comment',
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
        console.log('SignedInPage: ui: ', ui);


        return (
            <div className={`${className || ''} signed-in-page-comp`}>
                <Header
                    className="header" i18n={i18n} extraItemsLeft={menuToggle}
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
    }
)(SignedInPage);

SignedInPage = withRouter(SignedInPage);

export default SignedInPage;
