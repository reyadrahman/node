import AccountButton from './AccountButton.jsx';
import LanguageButton from './LanguageButton.jsx';

import React, { PropTypes } from 'react';
import { Glyphicon, Button, Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';

let Header = React.createClass({
    render() {
        const { className, i18n, i18n: { strings: { header: strings } },
                children, leftItemsBeforeLogo, leftItemsAfterLogo,
                rightItems } = this.props;

        return (
            <div className={`header-comp ${className || ''}`}>
                <div className="menu">
                    <div className="left-section">
                        { leftItemsBeforeLogo }
                        <Link to="/" className="logo" />
                        { leftItemsAfterLogo }
                    </div>
                    <div className="middle-section">

                    </div>
                    <div className="right-section">
                        { rightItems }
                        <LanguageButton i18n={i18n} />
                        <AccountButton i18n={i18n} />
                    </div>
                </div>
                { children }
            </div>
        );
    },
});

export default Header;
