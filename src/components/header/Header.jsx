import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import * as actions from '../../actions/actions.js';
import Dropdown from '../dropdown/Dropdown.jsx';
import SearchBar from '../search-bar/SearchBar.jsx';
import { withRouter } from 'react-router';

import styles from './header.scss';

let Header = React.createClass({
    onSearchSubmit(searchType, searchPhrase) {
        console.log('HomeIntro searchSubmitted', searchType, searchPhrase);
        this.props.router.push(`/search/${searchType}/${encodeURIComponent(searchPhrase)}`);
    },

    onConnectionSelect(selection) {
        console.log('connection select: ', selection);
        if (selection.value === 'signin') {
            this.props.openSignin();
        } else if (selection.value === 'signup') {
            this.props.openSignup();
        } else if (selection.value === 'signout') {
            this.props.signout();
        } else if (selection.value === 'verify') {
            this.props.openVerifyRegistration();
        }
    },

    render() {
        console.log('Header render');
        let { i18n, i18n: { strings: { header: hs } }, currentUser,
              isHome, initialSearchQuery } = this.props;

        let connection = [];
        let connectionPlaceholder;
        if (currentUser) {
            if (!currentUser.email_verified) {
                connection.push({ value: 'verify', label: hs.verifyRegistration });
            }
            connection.push(
                { value: 'signout', label: hs.signout }
            );
            connectionPlaceholder = currentUser.given_name.toUpperCase();
        } else {
            connection.push(
                { value: 'signin', label: hs.signin },
                { value: 'signup', label: hs.signup },
                { value: 'verify', label: hs.verifyRegistration }
            );
            connectionPlaceholder = hs.connection;
        }

        let leftSection = isHome ? (
            <div className={styles.leftSectionMenu}>
                <Link className={styles.menuItem} to="/a">{hs.photos}</Link>
                <Link className={styles.menuItem} to="/b">{hs.videos}</Link>
                <Link className={styles.menuItem} to="/stories">{hs.stories}</Link>
            </div>
        ) : (
            <div className={styles.leftSectionSearchBar}>
                <SearchBar
                    i18n={i18n}
                    initialQuery={initialSearchQuery}
                    onSubmit={this.onSearchSubmit}
                    small />
            </div>
        );

        return (
            <div className={[styles.root, isHome ? styles.isHome : ''].join(' ')}>
                { leftSection }
                <div className={styles.logo}>
                </div>
                <div className={styles.rightMenu}>
                    <Link className={styles.menuItem} to="/light-box">{hs.lightBox}</Link>
                    <Link className={styles.menuItem} to="/basket">{hs.basket}</Link>
                    <Dropdown
                        baseClassName="Header-Connection"
                        value={''}
                        options={connection}
                        onChange={this.onConnectionSelect}
                        placeholder={connectionPlaceholder}
                        />
                </div>
            </div>
        );
    },

});

Header = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        openSignup: actions.openSignup,
        openSignin: actions.openSignin,
        openVerifyRegistration: actions.openVerifyRegistration,
        signout: actions.signout,
    }
)(Header);

Header = withRouter(Header);

export default Header;
