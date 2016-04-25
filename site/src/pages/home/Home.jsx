import React from 'react'

import styles from './style.scss';

//console.log(styles);

let Home = React.createClass({
    render() {
        return (
            <div className={styles.title}>Hi there!!</div>
        )
    }
});

export default Home
