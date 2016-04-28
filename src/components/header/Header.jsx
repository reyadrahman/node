import React, {PropTypes} from 'react';
import { Link } from 'react-router';

import styles from './header.scss';

let Header = React.createClass({
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
                </div>
            </div>
        )
    }
});

export default Header;
