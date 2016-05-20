import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
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
            { label: 'Sign in', value: 'signin' },
            { label: 'Sign up', value: 'signup' },
            { label: 'Verify registration', value: 'verify' },
        ];

        const buttonClass = transparent ? `${ss.button} ${ss.transparent}` : ss.button;

        return (
            <div className={`${ss.root} ${className || ''} ${transparent ? ss.transparent : ''}`}>
                <div className={ss.leftSection}>
                    <button
                        className={`${buttonClass} ${sideMenu ? ss.active : ''} icon-menu`}
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
                    <button
                        onClick={this.props.toggleFullscreen}
                        className={`${buttonClass} ${fullscreen ? ss.active : ''} ` +
                                   `icon-resize-full-alt`}
                    />
                    {
                        !hideSearchBar &&
                            <SearchBar
                                initialSearchPhrase={searchState.query.searchPhrase}
                                i18n={i18n} styles={styles}
                                onSubmit={this.searchSubmitted}
                            />
                    }
                    {
                        currentUser ?
                            <button
                                onClick={this.props.signout}
                                className={`${buttonClass} icon-logout`}
                                title={strings.signout}
                            /> :
                            <Dropdown
                                options={signInUpVerifyOptions}
                                styles={styles}
                                activeItemRenderer={() => (
                                    <button
                                        className={`${buttonClass} icon-login`}
                                        title={strings.signin}
                                    />
                                )}
                                onChange={this.onConnectionSelect}
                            />

                    }
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



const SearchBar = React.createClass({
    getInitialState() {
        return {
            searchPhrase: this.props.initialSearchPhrase || '',
        };
    },

    searchPhraseChanged(e) {
        this.setState({ searchPhrase: e.target.value });
    },

    submitted(e) {
        e.preventDefault();
        if (this.props.onSubmit && this.state.searchPhrase) {
            this.props.onSubmit(this.state.searchPhrase);
        }
    },

    componentWillReceiveProps(newProps) {
        if (newProps.initialSearchPhrase !== this.props.initialSearchPhrase)
        {
            this.setState({ searchPhrase: newProps.initialSearchPhrase || '' });
        }
    },

    render() {
        let { i18n, className, styles, styles: { header: ss } } = this.props;
        let { searchPhrase } = this.state;
        return (
            <form className={ss.searchForm} onSubmit={this.submitted}>
                <input
                    className={ss.searchInput}
                    value={searchPhrase}
                    placeholder={'Search'}
                    onChange={this.searchPhraseChanged}
                />
                <button
                    type="submit"
                    className={`${ss.searchButton} icon-search`}
                />
            </form>
        );
    },
});


export default Header;
