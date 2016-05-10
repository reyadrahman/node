import React from 'react';

// TODO use the local dropdown and remove react-dropdown
import Dropdown from '../dropdown/Dropdown.jsx';

import styles from './search-bar.scss';

const SearchBar = React.createClass({
    getInitialState() {
        return {
            type: 'image',
            searchPhrase: '',
        };
    },

    typeChanged(selection) {
        this.setState({ type: selection.value });
    },

    searchPhraseChanged(e) {
        this.setState({ searchPhrase: e.target.value });
    },

    submitted(e) {
        e.preventDefault();
        if (this.props.onSubmit && this.state.type && this.state.searchPhrase) {
            this.props.onSubmit(this.state.type, this.state.searchPhrase);
        }
    },

    componentWillReceiveProps(newProps) {
        if (newProps.initialQuery &&
            newProps.initialQuery !== this.props.initialQuery)
        {
            this.setState({ ...newProps.initialQuery });
        }
    },

    render() {
        let { i18n, className, small } = this.props;
        let { type, searchPhrase } = this.state;
        return (
            <form
                className={[styles.root, small ? styles.small
                    : '', className || ''].join(' ')}
                onSubmit={this.props.submitted}
            >
                <div className={styles.typeAndSearch}>
                    <TypeDropdown
                        i18n={i18n} small={small} onChange={this.typeChanged} value={type}
                    />
                    <div className={styles.separator1} />
                    <SearchInput
                        value={searchPhrase} i18n={i18n}
                        onChange={this.searchPhraseChanged}
                    />
                </div>
                <SearchButton className={styles.small || ''} onClick={this.submitted} />
            </form>
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
                value={this.props.value}
                onChange={this.props.onChange}
                className={styles.searchInput}
        />
        );
    },
});

const SearchButton = React.createClass({
    render() {
        return (
            <button
                className={[styles.searchButton,
                    this.props.className || ''].join(' ')}
                onClick={this.props.onClick}
            />
        );
    },
});

export default SearchBar;
