import React from 'react';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router';
import { searchQueryToPath, pathToSearchQuery } from '../../misc/utils.js';

import backgroundPoster from '../../public/background-video-poster.jpg';
// import backgroundVideo from '../../public/background-video.mp4';

let Home = React.createClass({
    searchSubmitted(searchPhrase) {
        console.log('Home searchSubmitted', searchPhrase);
        this.props.router.push(searchQueryToPath({ searchPhrase }));
    },

    render() {
        console.log('Home render');
        const { className, styles, styles: { home: ss },
                i18n, i18n: { strings } } = this.props;
        return (
            <div className={`${ss.root} ${className || ''}`}>
                <div className={ss.logoAndTitle} />
                <div className={ss.background}>
                    <video
                        loop muted autoPlay poster={backgroundPoster}
                        className={ss.backgroundVideo}
                    >
                        {
                            //<source src={backgroundVideo} type="video/mp4" />
                        }
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

Home = withRouter(Home);


const SearchBar = React.createClass({
    getInitialState() {
        return {
            searchPhrase: '',
        };
    },

    searchPhraseChanged(e) {
        this.setState({ searchPhrase: e.target.value });
    },

    submitted(e) {
        e.preventDefault();
        if (this.props.onSubmit && this.state.searchPhrase) {
            this.props.onSubmit(this.state.searchPhrase);
        }
    },

    render() {
        let { i18n, className, styles, styles: { home: ss } } = this.props;
        let { searchPhrase } = this.state;
        return (
            <form className={ss.searchForm} onSubmit={this.submitted}>
                <input
                    value={searchPhrase}
                    placeholder={'Search'} className={ss.searchInput}
                    onChange={this.searchPhraseChanged}
                />
                <button
                    type="submit"
                    className={`${ss.searchButton} icon-search`}
                />
            </form>
        );
    },
});



export default Home;
