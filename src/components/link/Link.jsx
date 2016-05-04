import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link as RLink} from 'react-router';
import * as actions from '../../actions/actions.js';
import * as url from '../../misc/url.js';

let Link = React.createClass({
    render() {
        console.log('Link render');
        let {to, lang, isLangInUrl, locationRedux, ...otherProps} = this.props;
        let finalTo = to;
        if (to === '.') {
            finalTo = locationRedux.pathname;
        } else if (to.startsWith('!')) {
            finalTo = url.insertLangIntoUrl(locationRedux.pathname, to.substr(1));
        } else if (isLangInUrl) {
            finalTo = url.insertLangIntoUrl(to, lang);
        }

        return (
            <RLink {...otherProps} to={finalTo} />
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

