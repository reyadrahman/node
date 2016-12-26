import React, { PropTypes } from 'react';
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
        clearTimeout(this.menuToggleTimeout)
        this.setState({ isMenuHovered: true });
    },

    onMenuToggleLeave() {
        this.menuToggleTimeout = setTimeout(() => {
            this.setState({
                isMenuHovered: false,
            });
        }, 500);
    },

    onMenuEnter() {
        clearTimeout(this.menuHoverTimeout)
        this.setState({ isMenuOpen: true });
    },

    onMenuLeave() {
        this.menuHoverTimeout = setTimeout(() => {
            this.setState({
                isMenuOpen: false,
            });
        }, 500);
    },

    render() {
        const { className, menu, i18n, i18n: { strings: { homeMenu: strings } } } = this.props;

        const { isMenuOpen, isMenuHovered } = this.state;
        const leftNavbarClass = isMenuOpen
            ? 'is-open' : isMenuHovered
            ? 'is-hovered' : '';
        const createNavItem = (to, icon, text, scroll) => {
            const Link = scroll ? ScrollLink : RouterLink;
            return (
                <li>
                    <Link href="#" to={to} spy={true} smooth={true} duration={500}>
                        <i className={"icon icon-"+icon}></i>
                        { text }
                    </Link>
                </li>
            );
        };

        var navItems = [];
        for(var i = 0; i < menu.length; i++) {
            navItems.push(createNavItem(menu[i].to, menu[i].glyph, menu[i].string, menu[i].scroll));
        }

        return (
            <div className={`home-menu-comp ${className || ''}`}>
                <button  className="menu-toggle icon-menu"
                    onClick={this.onMenuToggle}
                    onMouseEnter={this.onMenuToggleEnter}
                    onMouseLeave={this.onMenuToggleLeave}
                    ></button>
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
