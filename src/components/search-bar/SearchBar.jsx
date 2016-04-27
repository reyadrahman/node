import React from 'react';
import Dropdown from 'react-dropdown';

import './react-dropdown.scss';
import styles from './search-bar.scss';

const SearchBar = React.createClass({
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.typeAndSearch}>
                    <TypeDropdown />
                    <div className={styles.separator1} />
                    <SearchInput />
                </div>
                <SearchButton />
            </div>
        );
    }
});

const TypeDropdown = React.createClass({
    render() {
        const options = [
            { value: 'footage', label: 'Footage' },
            { value: 'image', label: 'Image' }
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
