import React, { PropTypes } from 'react';
import { Glyphicon } from 'react-bootstrap';
import Scroll from 'react-scroll';

const Link = Scroll.Link;

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
        }, 1500);
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
        }, 1500);
    },

    render() {
        const { className, i18n, i18n: { strings: { homeMenu: strings } } } = this.props;

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

        const navItems = [
            createNavItem('pricing', 'euro', 'Pricing'),
            createNavItem('team', 'user', 'Team'),
            createNavItem('services', 'ok', 'Features'),
            createNavItem('screenshots', 'picture', 'Screenshots'),
            createNavItem('updates', 'cog', 'Updates'),
            createNavItem('contact', 'envelope', 'Contact'),
        ];


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
