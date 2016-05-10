import React from 'react';
import Header from '../header/Header.jsx';
import Footer from '../footer/Footer.jsx';
import { connect } from 'react-redux';
import * as actions from '../../actions/actions.js';
import isEqual from 'lodash/isEqual';

import styles from './search-page.scss';

function createQuery(params) {
    const splat = params.splat;
    if (!splat) return null;
    const split = splat.split('/').filter(x => x);
    if (split.length < 2) return null;
    return { type: split[0], searchPhrase: decodeURIComponent(split[1]) };
}


let SearchPage = React.createClass({
    getInitialState() {
        return {
            //query: createQuery(this.props.routeParams),
        };
    },


    startSearch(query) {
        this.props.search(query);
        //this.setState({ query });
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
        const { i18n, searchState } = this.props;
        //const { query } = this.state;
        console.log('SearchPage: ', this.props);

        const hasImages = searchState.hits && searchState.hits.hit.length > 0;
        const images = hasImages && (
            <div className={styles.imagesContainer}>
                {
                    searchState.hits.hit.map(hit => <Image data={hit} />)
                }
            </div>
        );

        const noResults = !hasImages && !searchState.isSearching && (
            <div className={styles.noResults}>NO RESULTS</div>
        );

        const searchingIndicator = searchState.isSearching && (
            <div className={styles.searchingIndicator}>SEARCHING...</div>
        );

        const hitCount = hasImages ? searchState.hits.found : 0;

        return (
            <div>
                <Header i18n={i18n} initialSearchQuery={searchState.query} />
                <div className={styles.imagesAndControlContainer}>
                    <div className={styles.title}>SOLITUDE GLACIER FROID BLEU CIEL GRIS</div>
                    <SearchStatusAndControl hitCount={hitCount} />
                    {
                        images || searchingIndicator || noResults
                    }
                </div>
                <Footer i18n={i18n} />
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

SearchPage.fetchData = function({ params, store }) {
    let q = createQuery(params);
    return store.dispatch(actions.search(q));
};


const Image = ({ data: { fields } }) => {
    console.log(fields);
    const style = {
        backgroundImage: `url(http://cdn.deepiks.io/thumbnails/${fields.deepikscode}.jpg)`
    };
    return (
        <div className={styles.imageContainer} style={style} />
    );
};

const SearchStatusAndControl = React.createClass({
    render() {
        let { hitCount } = this.props;
        return (
            <div className={styles.statusAndControlContainer}>
                {
                    hitCount > 0 &&
                    <div className={styles.hitCount}>
                        {`${hitCount} IMAGES`}
                    </div>
                }
            </div>
        );
    }
});

export default SearchPage;
