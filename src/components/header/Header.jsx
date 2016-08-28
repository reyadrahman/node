import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import * as actions from '../../actions/actions.js';
// import Dropdown from '../dropdown/Dropdown.jsx';
// import SearchBar from '../search-bar/SearchBar.jsx';
import { searchQueryToPath, pathToSearchQuery } from '../../misc/utils.js';
import { withRouter } from 'react-router';
import Dropdown from '../dropdown/Dropdown2.jsx';

let Header = React.createClass({
    searchSubmitted(searchPhrase) {
        console.log('HomeIntro searchSubmitted', searchPhrase);
        this.props.router.push(searchQueryToPath({
            ...this.props.searchState.query,
            searchPhrase,
        }));
    },

    languageChanged(value) {
        console.log('Header: languageChanged', value);
        this.props.changeLang(value);
    },

    toggleSideMenu() {
        this.props.toggleSideMenu();
    },

    onConnectionSelect(selection) {
        console.log('connection select: ', selection);
        if (selection === 'signin') {
            this.props.openSignin();
        } else if (selection === 'signup') {
            this.props.openSignup();
        } else if (selection === 'verify') {
            this.props.openVerifyRegistration();
        }
    },

    onSignOutSelect(selection) {
        if (selection === 'signout') {
            this.props.signout();
        }
    },

    makeFlag(item) {
        const { styles: { header: ss } } = this.props;
        let flag = item.value;
        flag = flag === 'en' ? 'us' : flag;
        return <span className={`flag flag-${flag} ${ss.flag}`} />
    },

    render() {
        console.log('Header render');
        const { className, styles, styles: { header: ss },
                i18n, i18n: { strings: { header: strings } }, currentUser,
                isHome, searchState, transparent, hideLogo, hideSearchBar,
                ui: { fullscreen, sideMenu }} = this.props;

        const ddOptions = [
            { label: 'English', value: 'en' },
            { label: 'Français', value: 'fr' },
        ];

        const signInUpVerifyOptions = [
            { label: strings.signin, value: 'signin' },
            { label: strings.signup, value: 'signup' },
            { label: strings.verifyRegistration, value: 'verify' },
        ];
        const signOutOptions = [
            { label: strings.signout, value: 'signout' },
        ];

        const buttonClass = transparent ? `${ss.button} ${ss.transparent}` : ss.button;

        let signInOutElem = null;
        if (currentUser) {
            console.log('Header render: have currentUser: ', currentUser);
            signInOutElem = (
                <Dropdown
                    options={signOutOptions}
                    styles={styles}
                    activeItemRenderer={() => (
                        <Glyphicon
                            glyph="log-out"
                            className={buttonClass}
                            title={strings.signout}
                        />
                    )}
                    onChange={this.onSignOutSelect}
                />
            );
            /*
            signInOutElem = (
                <button
                    onClick={this.props.signout}
                    className={`${buttonClass} icon-logout`}
                    title={strings.signout}
                />
            );
            */
        } else {
            console.log('Header render: don\'t have currentUser');
            signInOutElem = (
                <Dropdown
                    options={signInUpVerifyOptions}
                    styles={styles}
                    activeItemRenderer={() => (
                        <Glyphicon
                            glyph="log-in"
                            className={buttonClass}
                            title={strings.signin}
                        />
                    )}
                    onChange={this.onConnectionSelect}
                />
            );
        }

        return (
            <div className={`${ss.root} ${className || ''} ${transparent ? ss.transparent : ''}`}>
                <div className={ss.leftSection}>
                    <Glyphicon
                        glyph="menu-hamburger"
                        className={`${buttonClass} ${sideMenu ? ss.active : ''}`}
                        onClick={this.toggleSideMenu}
                    />
                    {
                        !hideLogo && <Link to="/" className={ss.logo} />
                    }
                </div>
                <div className={ss.middleSection} />
                <div className={ss.rightSection}>
                    <Dropdown
                        options={ddOptions} value={i18n.lang} styles={styles}
                        renderArrow
                        activeItemRenderer={
                            x => (
                                <div className={ss.language}>
                                    {this.makeFlag(x)}
                                    {x.label}
                                </div>
                            )
                        }
                        menuItemRenderer={
                            x => (
                                <div>
                                    {this.makeFlag(x)}
                                    {x.label}
                                </div>
                            )
                        }
                        onChange={this.languageChanged}
                    />
                    <Glyphicon glyph="fullscreen"
                        onClick={this.props.toggleFullscreen}
                        className={`${buttonClass} ${fullscreen ? ss.active : ''} `}
                    />
                    {signInOutElem}
                </div>
            </div>
        );
    },

});

Header = connect(
    state => ({
        currentUser: state.currentUser,
        searchState: state.search,
        ui: state.ui,
    }),
    {
        openSignup: actions.openSignup,
        openSignin: actions.openSignin,
        openVerifyRegistration: actions.openVerifyRegistration,
        signout: actions.signout,
        changeLang: actions.changeLang,
        toggleFullscreen: actions.toggleFullscreen,
        toggleSideMenu: actions.toggleSideMenu,
    }
)(Header);

Header = withRouter(Header);


export default Header;
