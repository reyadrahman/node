import React from 'react';
import { Link } from 'react-router';
import Cookies from 'js-cookie';
import _ from 'lodash';

const CookieConsent = React.createClass({
    getInitialState() {
        return { show: false };
    },

    dismiss(e) {
        e.preventDefault();
        Cookies.set('cookie-notice-dismissed', 'yes', { expires: 1000, path: '/' });
        this.setState({ show: false });
    },

    componentDidMount() {
        if (Cookies.get('cookie-notice-dismissed') !== 'yes') {
            this.setState({ show: true });
        }
    },

    render() {
        if (!this.state.show) return null;

        const { className, currentUser, i18n: { strings: { cookieConsent: strings } } } = this.props;
        const isDismissed = Cookies.get('cookie-notice-dismissed')

        return (
            <div className={`cookie-consent-comp ${className || ''}`}>
                { strings.message }
                { ' ' }
                <Link to="/privacy">{ strings.more }</Link>
                <button onClick={this.dismiss} className="dismiss">
                    <i className="icon-ok icon" /> { strings.dismiss }
                </button>
            </div>
        );
    }
});


export default CookieConsent;
