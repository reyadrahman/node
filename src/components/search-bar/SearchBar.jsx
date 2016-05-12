import React from 'react';
import Dropdown from '../dropdown/Dropdown.jsx';

const SearchBar = React.createClass({
    getInitialState() {
        return this.props.initialQuery || {
            searchPhrase: '',
            type: 'image',
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
        let { i18n, className, small, styles, styles: { searchBar: ss } } = this.props;
        let { type, searchPhrase } = this.state;
        return (
            <form
                className={[ss.root, small ? ss.small
                    : '', className || ''].join(' ')}
                onSubmit={this.props.submitted}
            >
                <div className={ss.typeAndSearch}>
                    <TypeDropdown
                        i18n={i18n} styles={styles} small={small}
                        onChange={this.typeChanged} value={type}
                    />
                    <div className={ss.separator1} />
                    <SearchInput
                        value={searchPhrase} i18n={i18n}
                        styles={styles} onChange={this.searchPhraseChanged}
                    />
                </div>
                <SearchButton
                    styles={styles} className={ss.small || ''}
                    onClick={this.submitted}
                />
            </form>
        );
    },
});

const TypeDropdown = React.createClass({
    render() {
        let { i18n: { strings }, styles: { searchBar: ss }, small, value,
              onChange } = this.props;

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
                onChange={onChange}
            />
        );
    },
});

const SearchInput = React.createClass({
    render() {
        const { styles: { searchBar: ss }, value, onChange } = this.props;
        return (
            <input
                placeholder="Recherche rapide d'images de haute qualite"
                type="text"
                value={value}
                onChange={onChange}
                className={ss.searchInput}
        />
        );
    },
});

const SearchButton = React.createClass({
    render() {
        const { styles: { searchBar: ss }, onClick, className } = this.props;
        return (
            <button
                className={[ss.searchButton, className || ''].join(' ')}
                onClick={onClick}
            />
        );
    },
});

export default SearchBar;
