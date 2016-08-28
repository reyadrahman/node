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
        const { styles, styles: { sideMenu: ss }, menu, value } = this.props;
        const { openItemIndex } = this.state;

        return menu.map((p, i) => (
            <div className={ss.menuItemContainer}>
                <div className={`${ss.menuItemParent} ${openItemIndex === i || p.value === value ? ss.active : ''}`}>
                    <Link
                        key={i} to={p.link || ''}
                        onClick={
                            p.children && p.children.length > 0 ?
                                (e) => this.toggleItem(e, i) : null
                        }
                    >
                        <Glyphicon glyph={p.icon} className={ss.menuIcon} />
                        {p.label}
                        <Glyphicon
                            glyph={!p.children ? '' : openItemIndex === i ? `minus` : `plus`}
                            className={ !p.children ? '' : ss.fold }
                        />

                    </Link>
                </div>
                {
                    !p.children || p.children.length === 0 ? null :
                        <div className={`${ss.menuItemChildren} ${openItemIndex === i ? `${ss.open} ${ss[`has-${p.children.length}-children`]}` : ''}`}>
                            {
                                p.children.map((c, j) => (
                                    <div className={`${ss.menuItemChild} ${c.value === value ? ss.active : ''}`}>
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
        const { isOpen, className, styles, styles: { sideMenu: ss }, i18n,
                transparent, i18n: { strings: { sideMenu: strings } } } = this.props;

        return (
            <div className={`${ss.root} ${isOpen ? '' : ss.hide} ${transparent ? ss.transparent : ''} ${className || ''}`}>
                {this.createMenu()}
            </div>
        );
    }
});

export default SideMenu;
