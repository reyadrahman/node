import * as actions from '../../actions/actions.js';
import Header from '../header/Header.jsx';
import SideMenu from '../side-menu/SideMenu.jsx';

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';


let PublicPage = React.createClass({
    isSignedIn(props) {
        const { currentUser } = props || this.props;
        return currentUser && currentUser.attributes && currentUser.attributes.sub;
    },

    componentDidMount() {
        if (!this.isSignedIn()) {
            this.props.router.push('/');
            //this.props.openSignin();
        }
    },

    componentDidUpdate(oldProps) {
        if (this.isSignedIn(oldProps) && !this.isSignedIn()) {
            this.props.router.push('/');
            //this.props.openSignin();
        }
    },

    render() {
        const { className, children, styles, styles: { publicPage: ss },
                i18n, i18n: { strings: { publicPage: strings } },
        } = this.props;

        const cs = React.cloneElement(children, {
            i18n,
            styles,
            // className: ss.content,
        });

        return (
            <div className={`${ss.root} ${className || ''}`}>
                { cs }
            </div>
        )
    }
});

PublicPage = connect(
    state => ({
        currentUser: state.currentUser,
        ui: state.ui,
    }),
    {
        openSignin: actions.openSignin,
    }
)(PublicPage);

PublicPage = withRouter(PublicPage);

export default PublicPage;
