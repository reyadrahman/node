import React, { PropTypes } from 'react';
import { Glyphicon } from 'react-bootstrap';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router';


let Header = React.createClass({
    getInitialState() {
        return {
            isMenuOpen: false,
            isMenuHovered: false,
        };
        this.menuHoverTimeout = null;
        this.menuToggleTimeout = null;
    },

    onMenuToggle() {
        this.setState({ isMenuOpen: !this.state.isMenuOpen });
    },

    onMenuToggleEnter() {
        console.log('onMenuToggleEnter');
        clearTimeout(this.menuToggleTimeout)
        this.setState({ isMenuHovered: true });
    },

    onMenuToggleLeave() {
        console.log('onMenuToggleLeave');
        this.menuToggleTimeout = setTimeout(() => {
            this.setState({
                isMenuHovered: false,
            });
        }, 500);
    },

    onMenuEnter() {
        console.log('onMenuEnter');
        clearTimeout(this.menuHoverTimeout)
        this.setState({ isMenuOpen: true });
    },

    onMenuLeave() {
        console.log('onMenuLeave');
        this.menuHoverTimeout = setTimeout(() => {
            this.setState({
                isMenuOpen: false,
            });
        }, 500);
    },

    render() {
        const { className, menu, isScroll, i18n, i18n: { strings: { homeMenu: strings } } } = this.props;

        const Link = isScroll ? ScrollLink : RouterLink;

        const { isMenuOpen, isMenuHovered } = this.state;
        const leftNavbarClass = isMenuOpen
            ? 'is-open' : isMenuHovered
            ? 'is-hovered' : '';
        const createNavItem = (to, icon, text) => (
            <li>
                <Link href="#" to={to} spy={true} smooth={true} duration={500}>
                    <Glyphicon glyph={icon} className="icon" />
                    { text }
                </Link>
            </li>
        );

        var navItems = [];
        for(var i = 0; i < menu.length; i++) {
            navItems.push(createNavItem(menu[i].to, menu[i].glyph, menu[i].string));
        }


        return (
            <div className="home-menu-comp">
                <Glyphicon
                    glyph="menu-hamburger"
                    className="menu-toggle"
                    onClick={this.onMenuToggle}
                    onMouseEnter={this.onMenuToggleEnter}
                    onMouseLeave={this.onMenuToggleLeave}
                />
                <nav
                    className={`left-navbar ${leftNavbarClass}`}
                    onMouseEnter={this.onMenuEnter}
                    onMouseLeave={this.onMenuLeave}
                >
                    <div className="scroller">
                        <ul>
                            { navItems }
                        </ul>
                    </div>
                </nav>

            </div>
        );
    },
});

export default Header;
