import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../actions/actions.js';
import connectRouterRedux from '../react-router-redux/connectReactRouterRedux.jsx';
import Signup from '../signup/Signup.jsx';
import VerifyRegistration from '../verify-registration/VerifyRegistration.jsx';
import Signin from '../signin/Signin.jsx';

import 'normalize.css';

import allStyles from '../../styles/styles.js';

export const App_ = React.createClass({
    render() {
        const { children, lang } = this.props;
        console.log('App render, lang', lang);
        const i18n = {
            lang,
            strings: translations[lang],
        };
        // TODO get style name from redux
        const styles = allStyles.style1;
        const ss = styles.app;

        const cs = React.cloneElement(children, { i18n, styles });


        return (
            <div className={ss.root}>
                {cs}
                <Signup i18n={i18n} styles={styles} />
                <VerifyRegistration i18n={i18n} styles={styles} />
                <Signin i18n={i18n} styles={styles} />
            </div>
        );
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
