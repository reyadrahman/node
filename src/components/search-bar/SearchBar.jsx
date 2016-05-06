import React from 'react';

// TODO use the local dropdown and remove react-dropdown
import Dropdown from 'react-dropdown';

import './react-dropdown.scss';
import styles from './search-bar.scss';

const SearchBar = React.createClass({
    render() {
        let {i18n} = this.props;
        return (
            <div className={styles.root}>
                <div className={styles.typeAndSearch}>
                    <TypeDropdown i18n={i18n} />
                    <div className={styles.separator1} />
                    <SearchInput i18n={i18n} />
                </div>
                <SearchButton />
            </div>
        );
    }
});

const TypeDropdown = React.createClass({
    render() {
        let {i18n: {strings}} = this.props;

        const options = [
            { value: 'image', label: strings.search.image },
            { value: 'footage', label: strings.search.footage },
        ];
        return (
            <Dropdown
                baseClassName="SearchBar-TypeDropdown"
                value={options[0]}
                options={options}
            />
        );
    }
});

const SearchInput = React.createClass({
    render() {
        return (
            <input
                placeholder="Recherche rapide d'images de haute qualite"
                type="text"
                className={styles.searchInput} />
        );
    }
});

const SearchButton = React.createClass({
    render() {
        return (
            <div className={styles.searchButton} />
        );
    }
});

export default SearchBar;
