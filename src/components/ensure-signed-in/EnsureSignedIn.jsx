import * as actions from '../../actions/actions.js';

import React from 'react';
import { connect } from 'react-redux';


let EnsureSignedIn = React.createClass({
    isSignedIn(props) {
        const { currentUser } = props || this.props;
        return currentUser && currentUser.attributes && currentUser.attributes.sub;
    },

    componentDidMount() {
        if (!this.isSignedIn()) {
            this.props.openSignin();
        }
    },

    componentDidUpdate(oldProps) {
        if (this.isSignedIn(oldProps) && !this.isSignedIn()) {
            this.props.openSignin();
        }
    },

    render() {
        const { className, styles, styles: { ensureSignedIn: ss },
                children, currentUser, i18n,
                i18n: { strings: { ensureSignedIn: strings } },
        } = this.props;

        if (!this.isSignedIn()) {
            console.log('EnsureSignedIn: not signed in');
            return (
                <h1 className={ss.pleaseSignIn}>
                    {strings.pleaseSignIn}
                </h1>
            );
        }

        const cs = React.cloneElement(children, {
            i18n, styles, className,
        });
        console.log('EnsureSignedIn: signed in');
        return Array.isArray(cs) ? cs[0] : cs;
    }
});

EnsureSignedIn = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        openSignin: actions.openSignin,
    }
)(EnsureSignedIn);

export default EnsureSignedIn;
