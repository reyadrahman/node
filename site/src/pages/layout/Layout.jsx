import React from 'react'

import 'normalize.css';

import styles from './layout.scss';

let Layout = React.createClass({
    render: function(){
        return (
            <div className={styles.root}>
                {this.props.children}
            </div>
        )
    }
});

export default Layout
