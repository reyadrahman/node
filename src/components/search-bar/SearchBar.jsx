import React from 'react';

// TODO use the local dropdown and remove react-dropdown
import Dropdown from '../dropdown/Dropdown.jsx';

import styles from './search-bar.scss';

const SearchBar = React.createClass({
    getInitialState() {
        return {
            type: 'image',
        };
    },

    typeChanged(selection) {
        this.setState({ type: selection.value });
    },

    render() {
        let { i18n, className, small } = this.props;
        let { type } = this.state;
        return (
            <div className={[styles.root, small ? styles.small : '', className || ''].join(' ')}>
                <div className={styles.typeAndSearch}>
                    <TypeDropdown
                        i18n={i18n} small={small} onChange={this.typeChanged} value={type}
                    />
                    <div className={styles.separator1} />
                    <SearchInput i18n={i18n} />
                </div>
                <SearchButton className={styles.small || ''} />
            </div>
        );
    },
});

const TypeDropdown = React.createClass({
    render() {
        let { i18n: { strings }, small, value } = this.props;

        const options = [
            { value: 'image', label: strings.search.image },
            { value: 'footage', label: strings.search.footage },
        ];
        return (
            <Dropdown
                baseClassName="SearchBar-TypeDropdown"
                value={options.find(x => x.value === value)}
                options={options}
                small={small}
                onChange={this.props.onChange}
            />
        );
    },
});

const SearchInput = React.createClass({
    render() {
        return (
            <input
                placeholder="Recherche rapide d'images de haute qualite"
                type="text"
                className={styles.searchInput}
        />
        );
    },
});

const SearchButton = React.createClass({
    render() {
        return (
            <div className={[styles.searchButton, this.props.className || ''].join(' ')} />
        );
    },
});

export default SearchBar;
