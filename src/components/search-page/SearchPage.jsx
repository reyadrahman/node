import React from 'react';
import Header from '../header/Header.jsx';
import Footer from '../footer/Footer.jsx';
import { connect } from 'react-redux';
import * as actions from '../../actions/actions.js';
import isEqual from 'lodash/isEqual';


function createQuery(params) {
    const splat = params.splat;
    if (!splat) return null;
    const split = splat.split('/').filter(x => x);
    if (split.length < 2) return null;
    return { type: split[0], searchPhrase: decodeURIComponent(split[1]) };
}


let SearchPage = React.createClass({

    startSearch(query) {
        this.props.search(query);
        // this.setState({ query });
    },

    componentDidMount() {
        const q = createQuery(this.props.routeParams);
        if (q && !isEqual(q, this.props.searchState.query)) {
            this.startSearch(q);
        }
    },

    componentWillReceiveProps(newProps) {
        const oldQ = createQuery(this.props.routeParams);
        const newQ = createQuery(newProps.routeParams);
        if (!isEqual(oldQ, newQ)) {
            this.startSearch(newQ);
        }
    },

    render() {
        const { i18n, searchState, styles, styles: { searchPage: ss } } = this.props;
        console.log('SearchPage: ', this.props);

        const hasImages = searchState.hits && searchState.hits.hit.length > 0;
        const images = hasImages && (
            <div className={ss.imagesContainer}>
                {
                    searchState.hits.hit.map(hit => <Image data={hit} styles={styles} />)
                }
            </div>
        );

        const noResults = !hasImages && !searchState.isSearching && (
            <div className={ss.noResults}>NO RESULTS</div>
        );

        const searchingIndicator = searchState.isSearching && (
            <div className={ss.searchingIndicator}>SEARCHING...</div>
        );

        const hitCount = hasImages ? searchState.hits.found : 0;

        return (
            <div>
                <Header i18n={i18n} styles={styles} initialSearchQuery={searchState.query} />
                <div className={ss.imagesAndControlContainer}>
                    <div className={ss.title}>SOLITUDE GLACIER FROID BLEU CIEL GRIS</div>
                    <SearchStatusAndControl styles={styles} hitCount={hitCount} />
                    {
                        searchingIndicator || images || noResults
                    }
                </div>
                <Footer i18n={i18n} styles={styles} />
            </div>
        );
    },
});

SearchPage = connect(
    state => ({
        searchState: state.search,
    }), {
        search: actions.search,
    }
)(SearchPage);

SearchPage.fetchData = function ({ params, store }) {
    let q = createQuery(params);
    return store.dispatch(actions.search(q));
};


const Image = ({ data: { fields }, styles: { searchPage: ss } }) => {
    console.log(fields);
    const style = {
        backgroundImage: `url(http://cdn.deepiks.io/thumbnails/${fields.deepikscode}.jpg)`,
    };
    return (
        <div className={ss.imageContainer} style={style} />
    );
};

const SearchStatusAndControl = React.createClass({
    render() {
        let { hitCount, styles: { searchPage: ss } } = this.props;
        return (
            <div className={ss.statusAndControlContainer}>
                {
                    hitCount > 0 &&
                    <div className={ss.hitCount}>
                        {`${hitCount} IMAGES`}
                    </div>
                }
            </div>
        );
    },
});

export default SearchPage;
