import Header from '../header/Header.jsx';
import Footer from '../footer/Footer.jsx';
import * as actions from '../../actions/actions.js';
import React from 'react';
import { withRouter } from 'react-router';
import { Grid, Cell, CellOverlay } from '../grid/Grid.jsx';
import { searchQueryToPath, pathToSearchQuery } from '../../misc/utils.js';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import sumBy from 'lodash/sumBy';
import get from 'lodash/get';


let SearchPage = React.createClass({

    componentDidMount() {
        const query = pathToSearchQuery(this.props.routeParams.splat);
        if (query && !isEqual(query, this.props.searchState.query)) {
            this.props.search(query);
        }
    },

    componentWillReceiveProps(newProps) {
        const oldQ = pathToSearchQuery(this.props.routeParams.splat);
        const newQ = pathToSearchQuery(newProps.routeParams.splat);
        if (!isEqual(oldQ, newQ)) {
            this.props.search(newQ);
        }
    },

    bucketSelected(bucket) {
        const query = {
            ...this.props.searchState.query,
            filterPhotographer: bucket.value,
        };
        this.props.router.push(searchQueryToPath(query));
    },

    filterChanged(query) {
        this.props.router.push(searchQueryToPath(query));
    },

    removeFilterClicked() {
        const query = {
            ...this.props.searchState.query,
            filterPhotographer: '',
        };
        this.props.router.push(searchQueryToPath(query))
    },

    render() {
        const { i18n, searchState, styles, styles: { searchPage: ss } } = this.props;
        console.log('SearchPage: ', this.props);

        const searchingIndicator = searchState.isSearching && (
            <div className={ss.searchingIndicator}>SEARCHING...</div>
        );

        let hasImages;
        let grid;
        let imageCount;
        let photographerCount;

        if (searchState.query.filterPhotographer) {
            const hits = get(searchState, 'results.hits.hit');

            hasImages = hits && hits.length > 0;
            imageCount = hasImages ? searchState.results.hits.found : 0;
            photographerCount = 0;

            grid = hasImages && (
                <Grid styles={styles}>
                    {
                        hits.map((hit, i) => (
                            <Image
                                key={i}
                                hit={hit}
                                styles={styles}
                                onClick={this.imageSelected}
                            />
                        ))
                    }
                </Grid>
            );
        } else {
            const buckets = get(searchState, 'results.facets.credit.buckets');
            hasImages = buckets && buckets.length > 0;
            imageCount = hasImages ? searchState.results.hits.found : 0;
            photographerCount = hasImages ? buckets.length : 0;

            grid = hasImages && (
                <Grid styles={styles}>
                    {
                        buckets.map((bucket, i) => (
                            <FacetedImage
                                key={i}
                                bucket={bucket}
                                styles={styles}
                                onClick={this.bucketSelected}
                            />
                        ))
                    }
                </Grid>
            );
        }

        const noResults = !hasImages && !searchState.isSearching && (
            <div className={ss.noResults}>NO RESULTS</div>
        );

        return (
            <div>
                <Header i18n={i18n} styles={styles} initialSearchPhrase={searchState.query} />
                <div className={ss.imagesAndControlContainer}>
                    <div className={ss.title}>SOLITUDE GLACIER FROID BLEU CIEL GRIS</div>
                    <SearchStatusAndControl
                        styles={styles}
                        hitCount={imageCount}
                        photographerCount={photographerCount}
                        query={searchState.query}
                        onFilterChange={this.filterChanged}
                        onRemoveFilterClick={this.removeFilterClicked}
                    />
                    {
                        searchingIndicator || grid || noResults
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

SearchPage = withRouter(SearchPage);

SearchPage.fetchData = function ({ params, store }) {
    let q = pathToSearchQuery(params.splat);
    return q ? store.dispatch(actions.search(q)) : Promise.resolve();
};


const Image = ({ hit: { fields }, styles, styles: { searchPage: ss }, onClick, children }) => {
    const style = {
        backgroundImage: `url(http://cdn.deepiks.io/thumbnails/${fields.deepikscode}.jpg)`,
    };
    return (
        <Cell styles={styles} onClick={onClick}>
            <div className={ss.imageCell} style={style} />
            {children}
        </Cell>
    );
};

const FacetedImage = React.createClass({

    clicked() {
        this.props.onClick(this.props.bucket);
    },

    render() {
        const { bucket, styles, styles: { searchPage: ss} } = this.props;
        return (
            <Image hit={bucket.hit[0]} styles={styles} onClick={this.clicked}>
                <CellOverlay styles={styles}>
                    {bucket.hit[0].fields.credit}
                    <span className={ss.imageCountOverlay}>
                        {`(${bucket.count})`}
                    </span>
                </CellOverlay>
            </Image>
        );
    }
});

const SearchStatusAndControl = React.createClass({
    getInitialState() {
        return {
            filterPhotographer: this.props.query.filterPhotographer,
        };
    },

    componentWillReceiveProps({ query: { filterPhotographer } }) {
        if (filterPhotographer !== this.props.query.filterPhotographer) {
            this.setState({ filterPhotographer });
        }
    },

    filterPhotographerChanged(e) {
        this.setState({ filterPhotographer: e.target.value });
    },

    formSubmitted(e) {
        e.preventDefault();
        this.props.onFilterChange({
            ...this.props.query,
            filterPhotographer: this.state.filterPhotographer,
        });
        console.log('filterPhotographer submitted');
    },

    render() {
        const { query, hitCount, photographerCount, styles: { searchPage: ss } } = this.props;
        return (
            <div className={ss.statusAndControlContainer}>
                <span className={ss.hitCount}>
                    {`${hitCount} image(s)`}
                </span>
                {
                    photographerCount > 0 &&
                        <span className={ss.photographerCount}>
                            {`from ${photographerCount} photographer(s)`}
                        </span>
                }
                <form className={ss.filters} onSubmit={this.formSubmitted}>
                    {'FILTERS  >  '}
                    <input
                        className={ss.filterPhotographer}
                        value={this.state.filterPhotographer}
                        onChange={this.filterPhotographerChanged}
                        placeholder={'Photographer'}
                    />
                    {
                        this.state.filterPhotographer &&
                            <div
                                className={ss.removeFilter}
                                onClick={this.props.onRemoveFilterClick}
                            />
                    }
                </form>
            </div>
        );
    },
});

export default SearchPage;
