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
            this.props.openSignin();
        }
    },

    componentDidUpdate(oldProps) {
        if (this.isSignedIn(oldProps) && !this.isSignedIn()) {
            // this.props.router.push('/');
            this.props.openSignin();
        }
    },

    onMenuToggle() {
        this.props.toggleSideMenu();
    },

    render() {
        const { className, styles, styles: { signedInPage: ss },
                children, currentUser, ui, location, i18n,
                i18n: { strings: { signedInPage: strings } },
        } = this.props;

        console.log('SignedInPage: props', this.props);
        let cs;
        if (this.isSignedIn()) {
            cs = React.cloneElement(children, {
                i18n,
                styles,
                className: `${ss.content} ${ui.sideMenu ? ss.sideMenuOpen : ''}`,
            });
        } else  {
            cs = (
                <h1 className={`${className || ''} ${ss.pleaseSignIn}`}>
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
                className={`${ss.menuToggle} ${ui.sideMenu ? ss.open : ''}`}
                onClick={this.onMenuToggle}
            />
    );

        return (
            <div className={`${className || ''} ${ss.root}`}>
                <Header
                    className={ss.header} i18n={i18n} styles={styles}
                    extraItemsLeft={menuToggle}
                />
                <SideMenu
                    className={`${ss.sideMenu} ${ui.sideMenu ? '' : ss.hide}`}
                    i18n={i18n} styles={styles}
                    menu={menu}
                    value={location.pathname.split('/')[1] || ''}
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
        openSignin: actions.openSignin,
        toggleSideMenu: actions.toggleSideMenu,
    }
)(SignedInPage);

SignedInPage = withRouter(SignedInPage);

export default SignedInPage;
