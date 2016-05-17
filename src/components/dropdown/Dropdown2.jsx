import React, { Component } from 'react';

const Dropdown = React.createClass({
    getInitialState() {
        return {
            isOpen: false,
        };
    },

    toggleMenu() {
        this.setState({ isOpen: !this.state.isOpen });
    },

    selected(value) {
        this.props.onChange && this.props.onChange(value);
        this.setState({ isOpen: false });
    },

    lostFocus() {
        console.log('language lost focus');
        this.setState({ isOpen: false });
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
        return item.label;
    },

    render() {
        const { styles: { dropdown: ss }, value, options,
                activeItemRenderer = this.renderActiveItem,
                className, menuClassName } = this.props;
        const { isOpen } = this.state;

        return (
            <div
                tabIndex="1"
                onBlur={this.lostFocus}
                className={`${ss.root} ${className || ''}`}
            >
                <div className={ss.activeItem} onClick={this.toggleMenu}>
                    {
                        activeItemRenderer(options.find(x => x.value === value))
                    }
                    <div className={`${ss.arrowDown} icon-angle-down`} />
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
