import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';

const Dropdown = React.createClass({
    getInitialState() {
        return {
            isOpen: false,
        };
    },

    toggleMenu() {
        if (this.state.isOpen) {
            this.rootElem.blur();
        }
        this.setState({ isOpen: !this.state.isOpen });
    },

    selected(value) {
        this.props.onChange && this.props.onChange(value);
        this.setState({ isOpen: false });
        this.rootElem.blur();
    },

    lostFocus(e) {
        console.log('dropdown lost focus, ', e.target === this.rootElem, e.target);
        setTimeout(() => {
            this.setState({ isOpen: false });
        }, 300);
    },

    makeMenuItem(item, isSelected) {
        const { styles: { dropdown: ss },
                menuItemRenderer = this.renderMenuItem } = this.props;
        return (
            <div
                className={`${ss.menuItem} ${isSelected ? ss.active : ''}`}
                onClick={() => this.selected(item.value)}
            >
                {menuItemRenderer(item, isSelected)}
            </div>
        );
    },

    renderMenuItem(item, isSelected) {
        return item.label;
    },

    renderActiveItem(item) {
        return item && item.label || this.props.placeholder;
    },

    render() {
        const { styles: { dropdown: ss }, value, options,
                activeItemRenderer = this.renderActiveItem,
                className, menuClassName, renderArrow } = this.props;
        const { isOpen } = this.state;

        return (
            <div
                tabIndex="1"
                onBlur={this.lostFocus}
                className={`${ss.root} ${className || ''}`}
                ref={e => { this.rootElem = e; }}
            >
                <div
                    className={`${ss.activeItem} ${renderArrow ? ss.withArrow : ''}`}
                    onClick={this.toggleMenu}
                >
                    {
                        activeItemRenderer(options.find(x => x.value === value))
                    }
                    {
                        renderArrow && <Glyphicon glyph="menu-down" className={ss.arrowDown} />
                    }
                </div>
                {
                    isOpen &&
                        <div className={`${ss.menu} ${menuClassName || ''}`}>
                            {options.map(x => this.makeMenuItem(x, x.value === value))}
                        </div>
                }
            </div>
        );
    },

});

export default Dropdown;
