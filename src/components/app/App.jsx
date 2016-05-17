import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../actions/actions.js';
import connectRouterRedux from '../react-router-redux/connectReactRouterRedux.jsx';
import Signup from '../signup/Signup.jsx';
import VerifyRegistration from '../verify-registration/VerifyRegistration.jsx';
import Signin from '../signin/Signin.jsx';
import * as utils from '../../misc/utils.js';

import 'normalize.css';
import '../../public/fonts/css/fontello.css';

import allStyles from '../../styles/styles.js';

export const App_ = React.createClass({
    fullscreenHandler(e) {
        this.props.setFullscreen(utils.isFullscreen());
    },

    componentDidMount() {
        document.addEventListener("fullscreenchange", this.fullscreenHandler);
        document.addEventListener("webkitfullscreenchange", this.fullscreenHandler);
        document.addEventListener("mozfullscreenchange", this.fullscreenHandler);
        document.addEventListener("MSFullscreenChange", this.fullscreenHandler);
    },

    render() {
        const { children, lang, ui } = this.props;
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
        ui: state.ui,
    }),
    {
        setFullscreen: actions.setFullscreen,
    }
)(App_);

App = connectRouterRedux(App);


export default App;
