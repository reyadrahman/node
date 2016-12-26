import AccountButton from './AccountButton.jsx';
import LanguageButton from './LanguageButton.jsx';

import React, { PropTypes } from 'react';
import { Glyphicon, Button, Dropdown, MenuItem, Collapse } from 'react-bootstrap';
import { Link } from 'react-router';

class Header extends React.Component {
    constructor() {
        super();

        this.state = {
            isCollapsed: false
        };
        this.collapseNavbar = this.collapseNavbar.bind(this);
    }

    collapseNavbar() {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    render() {
        const { className, i18n, i18n: { strings: { header: strings } },
                children, leftItemsBeforeLogo, leftItemsAfterLogo,
                rightItems } = this.props;

        return (
            <nav className={`navbar navbar-default navbar-fixed-top ${className || ''}`}>
                <div className="navbar-header">
                    { leftItemsBeforeLogo }
                    <Link to="/" className="navbar-brand" />
                    <Button className="collapsed navbar-toggle" onClick={this.collapseNavbar}>
                        <i className="icon-ellipsis-vert"></i>
                    </Button>
                </div>

                <Collapse in={this.state.isCollapsed}>
                    <div className="navbar-collapse" id="navbar-collapse">
                        <div className="navbar-left">
                            { leftItemsAfterLogo }
                        </div>
                        <div className="navbar-right">
                            { rightItems }
                            <LanguageButton i18n={i18n} />
                            <AccountButton i18n={i18n} />
                        </div>
                    </div>
                </Collapse>
                { children }
            </nav>
        );
    }
}

export default Header;
