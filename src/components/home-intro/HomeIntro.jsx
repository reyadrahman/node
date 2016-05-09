import React from 'react'
import Header from '../../components/header/Header.jsx';
import SearchBar from '../../components/search-bar/SearchBar.jsx';

import styles from './home-intro.scss';

import backgroundPoster from './background-poster.jpg';
import backgroundVideo from './background-video.mp4';

let HomeIntro = React.createClass({
    render() {
        console.log('HomeIntro render');
        let {i18n, i18n: {strings}} = this.props;
        return (
            <div className={styles.root}>
                <div className={styles.background}>
                    <video loop muted autoPlay poster={backgroundPoster} className={styles.backgroundVideo}>
                            <source src={backgroundVideo} type="video/mp4" />
                    </video>
                </div>
                <Header i18n={i18n} isHome />
                <div className={styles.searchContainer}>
                    <SearchBar i18n={i18n} />
                </div>
                <div className={styles.scrollDownContainer}>
                    <div className={styles.scrollDownLabel}>
                        {strings.home.introMessage}
                    </div>
                    <div
                        onClick={this.props.scrollDown}
                        className={styles.scrollDownArrow} />
                </div>
            </div>
        )
    }
});

export default HomeIntro;
