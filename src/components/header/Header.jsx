import React, {PropTypes} from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Dropdown from 'react-dropdown';
import {changeLang} from '../../actions/actions.js';

import styles from './header.scss';

const langs = [
    {value: 'english', label: 'ENGLISH'},
    {value: 'french', label: 'FRANÇAIS'},
];

let Header = React.createClass({
    onLangSelect(v) {
        console.log('onLangSelect: ', v);
        this.props.changeLang(v.value);
    },

    render() {
        console.log('Header render');
        let {i18n: {strings: {header: hs}}} = this.props;
        return (
            <div className={styles.root}>
                <div className={styles.leftMenu}>
                    <Link className={styles.menuItem} to="">{hs.photos}</Link>
                    <Link className={styles.menuItem} to="">{hs.videos}</Link>
                    <Link className={styles.menuItem} to="">{hs.stories}</Link>
                </div>
                <div className={styles.logo}>
                </div>
                <div className={styles.rightMenu}>
                    <Link className={styles.menuItem} to="">{hs.lightBox}</Link>
                    <Link className={styles.menuItem} to="">{hs.basket}</Link>
                    <Link className={styles.menuItem} to="">{hs.connections}</Link>
                    <Dropdown
                        baseClassName="Header-LangDropdown"
                        value={langs.find(l => l.value === this.props.i18n.lang)}
                        options={langs}
                        onChange={this.onLangSelect}
                    />
                </div>
            </div>
        )
    }
});
Header = connect(
    null,
    dispatch => ({
        changeLang: (lang) => dispatch(changeLang(lang)),
    })
)(Header);

export default Header;
