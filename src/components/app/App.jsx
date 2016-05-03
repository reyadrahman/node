import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import translations from '../../i18n/translations.js';
import * as actions from '../../actions/actions.js';
import {splitLangUrl} from '../../misc/url.js';

import 'normalize.css';

import styles from './app.scss';

export const App_ = React.createClass({
    render() {
        console.log('App render, lang', this.state.lang);
        let cs = React.cloneElement(this.props.children, {
            i18n: {
                lang: this.state.lang,
                strings: translations[this.state.lang],
            }
        });

        return (
            <div className={styles.root}>
                {cs}
            </div>
        )
    },

    getInitialState() {
        return {
            // will set it in componentWillMount
            // and componentWillReceiveProps
            lang: '',
        };
    },

    componentWillMount() {
        this.updateStore(this.props);
    },

    componentWillReceiveProps(newProps) {
        this.updateStore(newProps);
    },

    updateStore(props) {
        let pathname = props.location.pathname;
        props.dispatch(actions.changeLocation({pathname}));

        let urlSplit = splitLangUrl(pathname);
        let lang = urlSplit ? urlSplit.lang : props.systemLang;
        props.dispatch(actions.changeLang(lang));
        props.dispatch(actions.changeIsLangInUrl(Boolean(urlSplit)));

        this.setState({lang});
    }

});


const App = connect(
    state => ({
        systemLang: state.systemLang,
    })
)(App_);


export default App;
