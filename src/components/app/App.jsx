import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../actions/actions.js';
import connectRouterRedux from '../react-router-redux/connectReactRouterRedux.jsx';
import Signup from '../signup/Signup.jsx';
import VerifyRegistration from '../verify-registration/VerifyRegistration.jsx';
import Signin from '../signin/Signin.jsx';

import 'normalize.css';

import styles from './app.scss';

export const App_ = React.createClass({
    render() {
        let {children, lang} = this.props;
        console.log('App render, lang', lang);
        let i18n = {
            lang: lang,
            strings: translations[lang],
        };
        let cs = React.cloneElement(children, {i18n});

        return (
            <div className={styles.root}>
                {cs}
                <Signup i18n={i18n} />
                <VerifyRegistration i18n={i18n} />
                <Signin i18n={i18n} />
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
