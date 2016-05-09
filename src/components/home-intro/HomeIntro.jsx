import React from 'react'
import { withRouter } from 'react-router';
import Header from '../../components/header/Header.jsx';
import SearchBar from '../../components/search-bar/SearchBar.jsx';

import styles from './home-intro.scss';

import backgroundPoster from './background-poster.jpg';
import backgroundVideo from './background-video.mp4';

let HomeIntro = React.createClass({
    searchSubmitted(searchType, searchPhrase) {
        console.log('HomeIntro searchSubmitted', searchType, searchPhrase);
        this.props.router.push(`/search/${searchType}/${encodeURIComponent(searchPhrase)}`);
    },

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
                    <SearchBar i18n={i18n} onSubmit={this.searchSubmitted} />
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

HomeIntro = withRouter(HomeIntro);

export default HomeIntro;
