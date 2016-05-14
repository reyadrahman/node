import Header from '../header/Header.jsx';
import Footer from '../footer/Footer.jsx';
import * as actions from '../../actions/actions.js';
import React from 'react';
import { Grid, Cell, CellOverlay } from '../grid/Grid.jsx';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import sumBy from 'lodash/sumBy';


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

        const hasImages = searchState.hits && searchState.hits.length > 0;
        const hits = hasImages && searchState.hits.filter(hit =>
            hit.hits.hit && hit.hits.hit.length > 0
        );
        const images = hasImages && (
            <Grid styles={styles}>
                {
                    hits.map(hit => (
                        <FacetedImage key={hit.hits.hit[0].id} hit={hit} styles={styles} />
                    ))
                }
            </Grid>
        );

        const noResults = !hasImages && !searchState.isSearching && (
            <div className={ss.noResults}>NO RESULTS</div>
        );

        const searchingIndicator = searchState.isSearching && (
            <div className={ss.searchingIndicator}>SEARCHING...</div>
        );

        const hitCount = hasImages ? sumBy(hits, h => h.hits.found) : 0;
        const photographerCount = hasImages ? hits.length : 0;

        return (
            <div>
                <Header i18n={i18n} styles={styles} initialSearchQuery={searchState.query} />
                <div className={ss.imagesAndControlContainer}>
                    <div className={ss.title}>SOLITUDE GLACIER FROID BLEU CIEL GRIS</div>
                    <SearchStatusAndControl
                        styles={styles} hitCount={hitCount}
                        photographerCount={photographerCount}
                    />
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


const Image = ({ hit: { fields }, styles, styles: { searchPage: ss }, children }) => {
    const style = {
        backgroundImage: `url(http://cdn.deepiks.io/thumbnails/${fields.deepikscode}.jpg)`,
    };
    return (
        <Cell className={ss.imageCell} style={style} styles={styles}>
            {children}
        </Cell>
    );
};

const FacetedImage = ({ hit, styles, styles: { searchPage: ss} }) => {
    const { fields } = hit.hits.hit[0];
    return (
        <Image key={hit.hits.hit[0].id} hit={hit.hits.hit[0]} styles={styles}>
            <CellOverlay styles={styles}>
                {fields.credit}
                <span className={ss.imageCountOverlay}>
                    {`(${hit.hits.found})`}
                </span>
            </CellOverlay>
        </Image>
    );
}

const SearchStatusAndControl = React.createClass({
    render() {
        let { hitCount, photographerCount, styles: { searchPage: ss } } = this.props;
        return hitCount > 0 && (
            <div className={ss.statusAndControlContainer}>
                <span className={ss.hitCount}>
                    {`${hitCount} images`}
                </span>
                <span className={ss.photographerCount}>
                    {`from ${photographerCount} photographers`}
                </span>
            </div>
        );
    },
});

export default SearchPage;
