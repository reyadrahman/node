import * as actions from '../../app-state/actions.js';
import Flag from '../flag/Flag.jsx';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap';

let LanguageButton = React.createClass({
    onMenuSelect(eventKey) {
        this.props.setLanguage(eventKey);
    },

    render() {
        const { className, i18n, i18n: { strings: { languageButton: strings } } } = this.props;

        const langs = [
            { label: 'English', lang: 'en', flagCountryCode: 'us' },
            { label: 'Français', lang: 'fr', flagCountryCode: 'fr' },
        ];
        const currentLang = langs.find(x => x.lang === i18n.lang);
        const title = (
            <span>
                <Flag i18n={i18n} countryCode={currentLang.flagCountryCode} />
                { ' ' + currentLang.label }
            </span>
        );
        const menuItems = langs.map((x, i) => (
            <MenuItem key={i} eventKey={x.lang}>
                <Flag i18n={i18n} countryCode={x.flagCountryCode} />
                { ' ' + x.label }
            </MenuItem>
        ));

        return (
            <DropdownButton
                className={`language-button-comp ${className || ''}`}
                title={title}
                onSelect={this.onMenuSelect}
                pullRight
            >
                { menuItems }
            </DropdownButton>
        );
    },
});

LanguageButton = connect(
    null,
    {
        setLanguage: actions.setLanguage,
    }
)(LanguageButton);

export default LanguageButton;
