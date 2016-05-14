import React from 'react';
import Header from '../header/Header.jsx';
import Footer from '../footer/Footer.jsx';

export const Grid = React.createClass({

    render() {
        const { styles, styles: { grid: ss }, className, children } = this.props;
        return (
            <div className={`${ss.gridRoot} ${className || ''}`}>
                {
                    children
                }
            </div>
        );
    }

});

export const Cell = ({ styles: { grid: ss }, children, className, style }) => (
    <div className={`${ss.cell} ${className || ''}`} style={style}>
        {children}
    </div>
);

export const CellOverlay = ({ styles: { grid: ss }, children, className, style }) => (
    <div className={`${ss.cellOverlay} ${className || ''}`} style={style}>
        {children}
    </div>
);
