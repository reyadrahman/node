import React, {PropTypes} from 'react';
import {Link} from 'react-router'
import {connect} from 'react-redux';
import * as actions from '../../actions/actions.js';

import styles from './header.scss';

let Header = React.createClass({
    render() {
        console.log('Header render');
        let {i18n: {strings: {header: hs}}} = this.props;
        return (
            <div className={styles.root}>
                <div className={styles.leftMenu}>
                    <Link className={styles.menuItem} to="/a">{hs.photos}</Link>
                    <Link className={styles.menuItem} to="/b">{hs.videos}</Link>
                    <Link className={styles.menuItem} to="/stories">{hs.stories}</Link>
                </div>
                <div className={styles.logo}>
                </div>
                <div className={styles.rightMenu}>
                    <Link className={styles.menuItem} to="/light-box">{hs.lightBox}</Link>
                    <Link className={styles.menuItem} to="/basket">{hs.basket}</Link>
                    <Link
                        className={styles.menuItem}
                        to="."
                        onClick={this.props.openSignup}
                    >
                        {hs.connections}
                    </Link>
                </div>
            </div>
        )
    },

});

Header = connect(
    null,
    {
        openSignup: actions.openSignup,
    }
)(Header);

export default Header;
