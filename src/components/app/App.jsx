import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../app-state/actions.js';
import * as utils from '../../client/client-utils.js';
import { ModalBox } from '../modal-box-1/ModalBox1.jsx';
import CookieConsent from '../cookie-consent/CookieConsent.jsx';
const reportDebug = require('debug')('deepiks:App');

import '../../styles/theme-1/theme-1.scss';

export const App_ = React.createClass({
    fullscreenHandler(e) {
        this.props.setFullscreen(utils.isFullscreen());
    },

    componentWillMount() {
        this.props.setPageTitle(translations[this.props.lang].app.pageTitle);
    },

    componentWillReceiveProps(newProps) {
        if (newProps.lang !== this.props.lang) {
            this.props.setPageTitle(translations[newProps.lang].app.pageTitle);
        }
    },

    componentDidMount() {
        document.addEventListener("fullscreenchange", this.fullscreenHandler);
        document.addEventListener("webkitfullscreenchange", this.fullscreenHandler);
        document.addEventListener("mozfullscreenchange", this.fullscreenHandler);
        document.addEventListener("MSFullscreenChange", this.fullscreenHandler);
    },

    render() {
        const { currentUser, children, lang, ui, closeModal } = this.props;
        reportDebug('App render, lang', lang, ', props: ', this.props);
        const i18n = {
            lang,
            strings: translations[lang],
        };
        const cs = React.cloneElement(children, {
            i18n,
        });

        const ModalChild = ui.modalComponent;

        return (
            <div id="app-comp">
                {cs}
                <ModalBox i18n={i18n} isOpen={!!ModalChild} onRequestClose={closeModal}>
                    { ModalChild && <ModalChild i18n={i18n} /> }
                </ModalBox>
                <CookieConsent i18n={i18n} />
            </div>
        );
    },

});


let App = connect(
    state => ({
        systemLang: state.systemLang,
        lang: state.lang,
        ui: state.ui,
        currentUser: state.currentUser,
    }),
    {
        setFullscreen: actions.setFullscreen,
        closeModal: actions.closeModal,
    }
)(App_);



export default App;
