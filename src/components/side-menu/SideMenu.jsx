import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Glyphicon } from 'react-bootstrap';

const SideMenu = React.createClass({
    getInitialState() {
        return {
            openItemIndex: this.getActiveItemIndex(this.props.menu, this.props.value),
        };
    },

    toggleItem(e, i) {
        e.preventDefault();
        this.setState({ openItemIndex: this.state.openItemIndex === i ? -1 : i});
    },

    getActiveItemIndex(menu, value) {
        return menu.findIndex(x => x.value === value ||
            x.children && x.children.find(y => y.value === value)
        );
    },

    componentWillReceiveProps(newProps) {
        if (newProps.value !== this.props.value) {
            this.setState({
                openItemIndex: this.getActiveItemIndex(newProps.menu, newProps.value)
            });
        }
    },

    createMenu() {
        const { menu, value } = this.props;
        const { openItemIndex } = this.state;

        return menu.map((p, i) => (
            <div className="menu-item-container">
                <div className={`menu-item-parent ${openItemIndex === i || p.value === value ? 'active' : ''}`}>
                    <Link
                        key={i} to={p.link || ''}
                        onClick={
                            p.children && p.children.length > 0 ?
                                (e) => this.toggleItem(e, i) : null
                        }
                    >
                        <span className={`menu-icon ${ p.glyph ? 'glyphicon glyphicon-' + p.glyph : p.icon }`} />
                        {p.label}
                        <Glyphicon
                            glyph={!p.children ? '' : openItemIndex === i ? `minus` : `plus`}
                            className={ !p.children ? '' : 'fold' }
                        />

                    </Link>
                </div>
                {
                    !p.children || p.children.length === 0 ? null :
                        <div className={
                            openItemIndex === i
                                ? `menu-item-children open has-${p.children.length}-children`
                                : `menu-item-children`
                        }>
                            {
                                p.children.map((c, j) => (
                                    <div className={`menu-item-child ${c.value === value ? 'active' : ''}`}>
                                        <Link key={j} to={c.link} >
                                            {c.label}
                                        </Link>
                                    </div>
                                ))
                            }
                        </div>
                }
            </div>
        ));
    },

    render() {
        const { isOpen, className, i18n,
                i18n: { strings: { sideMenu: strings } } } = this.props;

        return (
            <div className={`side-menu-comp ${isOpen ? '' : 'hide-side-menu-comp'} ${className || ''}`}>
                {this.createMenu()}
            </div>
        );
    }
});

export default SideMenu;
