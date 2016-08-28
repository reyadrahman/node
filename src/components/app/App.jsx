import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../actions/actions.js';
import * as utils from '../../client/client-utils.js';
import { ModalBox } from '../modal-box-1/ModalBox1.jsx';

// import 'normalize.css';
// import '../../public/fonts/css/fontello.css';

// TODO load and unload the right css files for each style
import '../../styles/style-1/bootstrap.min.css';

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
        const { currentUser, children, lang, ui, closeModal } = this.props;
        console.log('App render, lang', lang, ', props: ', this.props);
        const i18n = {
            lang,
            strings: translations[lang],
        };
        // TODO get style name from redux
        const styles = allStyles.style1;
        const ss = styles.app;

        const cs = React.cloneElement(children, {
            i18n, styles,
        });

        const ModalChild = ui.modalComponent;

        return (
            <div className={ss.root}>
                {cs}
                <ModalBox
                    styles={styles} i18n={i18n} isOpen={!!ModalChild}
                    onRequestClose={closeModal}>
                    {
                        ModalChild && <ModalChild styles={styles} i18n={i18n} />
                    }
                </ModalBox>
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
