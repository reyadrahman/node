import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link as RLink} from 'react-router';
import * as actions from '../../actions/actions.js';
import * as url from '../../misc/url.js';

let Link = React.createClass({
    render() {
        console.log('Link render');
        let {to, lang, isLangInUrl, locationRedux, ...otherProps} = this.props;
        let toWithLang = to;
        if (to.startsWith('!')) {
            toWithLang = url.insertLangIntoUrl(locationRedux.pathname, to.substr(1));
        } else if (isLangInUrl) {
            toWithLang = url.insertLangIntoUrl(to, lang);
        }

        return (
            <RLink {...otherProps} to={toWithLang} />
        );
    },

});

Link = connect(
    state => ({
        lang: state.lang,
        isLangInUrl: state.isLangInUrl,
        locationRedux: state.locationRedux,
    })
)(Link);

export default Link;

