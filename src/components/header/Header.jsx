import React from 'react'
import { Link } from 'react-router';

import styles from './header.scss';

let Header = React.createClass({
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.leftMenu}>
                    <Link className={styles.menuItem} to="">PHOTOS</Link>
                    <Link className={styles.menuItem} to="">VIDEOS</Link>
                    <Link className={styles.menuItem} to="">STORIES</Link>
                </div>
                <div className={styles.logo}>
                </div>
                <div className={styles.rightMenu}>
                    <Link className={styles.menuItem} to="">LIGHTBOX</Link>
                    <Link className={styles.menuItem} to="">PANIER</Link>
                    <Link className={styles.menuItem} to="">CONNEXION</Link>
                </div>
            </div>
        )
    }
});

export default Header;
