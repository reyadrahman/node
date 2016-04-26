import React from 'react'
import Header from '../../components/header/Header.jsx';
import SearchBar from '../../components/search-bar/SearchBar.jsx';

import styles from './home-intro.scss';

let HomeIntro = React.createClass({
    render() {
        return (
            <div className={styles.root}>
                <Header />
                <div className={styles.searchContainer}>
                    <SearchBar />
                </div>
                <div className={styles.scrollDownContainer}>
                    <div className={styles.scrollDownLabel}>
                        RACONTE MOI UNE HISTOIRE
                    </div>
                    <div className={styles.scrollDownArrow} />
                </div>
            </div>
        )
    }
});

export default HomeIntro;
