import React from 'react'

import styles from './header.scss';

let Header = React.createClass({
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.leftMenu}>
                    <div>PHOTOS</div>
                    <div>VIDEOS</div>
                    <div>STORIES</div>
                </div>
                <div className={styles.logo}>
                </div>
                <div className={styles.rightMenu}>
                    <div>LIGHTBOX</div>
                    <div>PANIER</div>
                    <div>CONNEXION</div>
                </div>
            </div>
        )
    }
});

export default Header;
