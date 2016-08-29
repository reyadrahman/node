import * as actions from '../../actions/actions.js';
import Flag from '../flag/Flag.jsx';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Glyphicon, DropdownButton, MenuItem } from 'react-bootstrap';

let LanguageButton = React.createClass({
    onMenuSelect(eventKey) {
        this.props.changeLang(eventKey);
    },

    render() {
        const { className, styles, styles: { languageButton: ss },
                i18n, i18n: { strings: { languageButton: strings } } } = this.props;

        const langs = [
            { label: 'English', lang: 'en', flagCountryCode: 'us' },
            { label: 'Français', lang: 'fr', flagCountryCode: 'fr' },
        ];
        const currentLang = langs.find(x => x.lang === i18n.lang);
        const title = (
            <span>
                <Flag
                    styles={styles} i18n={i18n}
                    countryCode={currentLang.flagCountryCode}
                />
                { ' ' + currentLang.label }
            </span>
        );
        const menuItems = langs.map((x, i) => (
            <MenuItem key={i} eventKey={x.lang}>
                <Flag styles={styles} i18n={i18n} countryCode={x.flagCountryCode} />
                { ' ' + x.label }
            </MenuItem>
        ));

        return (
            <DropdownButton
                className={`${ss.root} ${className || ''}`}
                title={title}
                onSelect={this.onMenuSelect}
                bsStyle={'link'}
                pullRight
            >
                { menuItems }
            </DropdownButton>
        );
    },
});

LanguageButton = connect(
    state => ({ }),
    {
        changeLang: actions.changeLang
    }
)(LanguageButton);

export default LanguageButton;
