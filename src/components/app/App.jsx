import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../actions/actions.js';
import connectRouterRedux from '../react-router-redux/connectReactRouterRedux.jsx';
import Signup from '../signup/Signup.jsx';
import VerifyRegistration from '../verify-registration/VerifyRegistration.jsx';
import Signin from '../signin/Signin.jsx';
import SideMenu from '../side-menu/SideMenu.jsx';
import * as utils from '../../client/client-utils.js';
import Header from '../header/Header.jsx';

import 'normalize.css';
import '../../public/fonts/css/fontello.css';

import allStyles from '../../styles/styles.js';

export const App_ = React.createClass({
    fullscreenHandler(e) {
        this.props.setFullscreen(utils.isFullscreen());
    },

    componentDidMount() {
        document.addEventListener("fullscreenchange", this.fullscreenHandler);
        document.addEventListener("webkitfullscreenchange", this.fullscreenHandler);
        document.addEventListener("mozfullscreenchange", this.fullscreenHandler);
        document.addEventListener("MSFullscreenChange", this.fullscreenHandler);
    },

    render() {
        const { currentUser, children, lang, ui, location } = this.props;
        console.log('App render, lang', lang, ', props: ', this.props);
        const i18n = {
            lang,
            strings: translations[lang],
        };
        // TODO get style name from redux
        const styles = allStyles.style1;
        const ss = styles.app;

        const sideMenuStrings = translations[lang].sideMenu;

        const userMenu = !currentUser ? [] : [
            {
                label: sideMenuStrings.bots,
                link: '/bots',
                icon: 'icon-th-large',
                value: 'bots',
            },
        ];

        const menu = [
            // {
            //     label: sideMenuStrings.search,
            //     icon: 'icon-search',
            //     children: [
            //         {
            //             label: sideMenuStrings.quickSearch,
            //             link: '/search',
            //         },
            //         {
            //             label: sideMenuStrings.smartSearch,
            //             link: '/search',
            //             value: 'search',
            //         },
            //     ],
            // },
            // {
            //     label: sideMenuStrings.lightboxes,
            //     link: '/lightboxes',
            //     icon: 'icon-th-large',
            //     value: 'lightboxes',
            // },
            ...userMenu,
            {
                label: sideMenuStrings.contacts,
                link: '/contacts',
                icon: 'icon-mail-alt',
                value: 'contacts',
            }
        ];


        const isHome = location.pathname === '/';
        const cs = React.cloneElement(children, {
            i18n, styles,
            className: `${ss.content} ${isHome ? ss.home : ''} ${ui.sideMenu ? ss.sideMenuOpen : ''}`,
        });

        return (
            <div className={ss.root}>
                <Header
                    className={`${ss.header} ${isHome ? ss.home : ''}`}
                    i18n={i18n} styles={styles}
                    transparent={isHome} hideLogo={isHome} hideSearchBar={isHome}
                />
                <SideMenu
                    className={`${ss.sideMenu} ${isHome ? ss.home : ''} ${ui.sideMenu ? '' : ss.hide}`}
                    i18n={i18n} styles={styles}
                    menu={menu}
                    value={location.pathname.split('/')[1] || ''}
                    transparent={isHome}
                />
                {cs}
                <Signup i18n={i18n} styles={styles} />
                <VerifyRegistration i18n={i18n} styles={styles} />
                <Signin i18n={i18n} styles={styles} />
            </div>
        );
    },

});


let App = connect(
    state => ({
        systemLang: state.systemLang,
        lang: state.lang,
        ui: state.ui,
        currentUser: state.currentUser,
    }),
    {
        setFullscreen: actions.setFullscreen,
    }
)(App_);

App = connectRouterRedux(App);


export default App;
