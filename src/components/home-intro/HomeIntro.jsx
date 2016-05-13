import React from 'react';
import { withRouter } from 'react-router';
import Header from '../../components/header/Header.jsx';
import SearchBar from '../../components/search-bar/SearchBar.jsx';

import backgroundPoster from '../../public/background-video-poster.jpg';
import backgroundVideo from '../../public/background-video.mp4';

let HomeIntro = React.createClass({
    searchSubmitted(searchType, searchPhrase) {
        console.log('HomeIntro searchSubmitted', searchType, searchPhrase);
        this.props.router.push(`/search/${searchType}/${encodeURIComponent(searchPhrase)}`);
    },

    render() {
        console.log('HomeIntro render');
        const { styles, styles: { homeIntro: ss },
                i18n, i18n: { strings } } = this.props;
        return (
            <div className={ss.root}>
                <div className={ss.logoAndTitle} />
                <div className={ss.background}>
                    <video
                        loop muted autoPlay poster={backgroundPoster}
                        className={ss.backgroundVideo}
                    >
                        <source src={backgroundVideo} type="video/mp4" />
                    </video>
                </div>
                {/*
                <Header i18n={i18n} styles={styles} isHome />
                */}
                <div className={ss.searchContainer}>
                    <SearchBar i18n={i18n} styles={styles} onSubmit={this.searchSubmitted} />
                </div>
                {/*
                <div className={ss.scrollDownContainer}>
                    <div className={ss.scrollDownLabel}>
                        {strings.home.introMessage}
                    </div>
                    <div
                        onClick={this.props.scrollDown}
                        className={ss.scrollDownArrow}
                    />
                </div>
                */}
            </div>
        );
    },
});

HomeIntro = withRouter(HomeIntro);

export default HomeIntro;
