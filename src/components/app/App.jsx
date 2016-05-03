import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../actions/actions.js';
import {splitLangUrl} from '../../misc/url.js';
import connectRouterRedux from '../react-router-redux/connectReactRouterRedux.jsx';

import 'normalize.css';

import styles from './app.scss';

export const App_ = React.createClass({
    render() {
        let {children, lang} = this.props;
        console.log('App render, lang', lang);
        let cs = React.cloneElement(children, {
            i18n: {
                lang: lang,
                strings: translations[lang],
            }
        });

        return (
            <div className={styles.root}>
                {cs}
            </div>
        )
    },

});


let App = connect(
    state => ({
        systemLang: state.systemLang,
        lang: state.lang,
    })
)(App_);

App = connectRouterRedux(App);


export default App;
