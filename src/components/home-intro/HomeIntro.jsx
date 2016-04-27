import React from 'react'
import Header from '../../components/header/Header.jsx';
import SearchBar from '../../components/search-bar/SearchBar.jsx';

import styles from './home-intro.scss';

import backgroundPoster from './background-poster.jpg';
import backgroundVideo from './background-video.mp4';

let HomeIntro = React.createClass({
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.background}>
                    <video loop muted autoPlay poster={backgroundPoster} className={styles.backgroundVideo}>
                            <source src={backgroundVideo} type="video/mp4" />
                    </video>
                </div>
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
