import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';

import 'normalize.css';

import styles from './app.scss';

export const App_ = React.createClass({
    /*
    getChildContext() {
        console.log('App getChildContext: ', this.props.lang);
        return {
            lang: this.props.lang,
            i18n: translations[this.props.lang],
        };
    },
    */

    render() {
        console.log('App render');
        let cs = React.cloneElement(this.props.children, {
            i18n: {
                lang: this.props.lang,
                strings: translations[this.props.lang],
            }
        });

        return (
            <div className={styles.root}>
                {cs}
            </div>
        )
    },
});


const App = connect(
    state => ({
        lang: state.lang,
    })
)(App_);


export default App;
