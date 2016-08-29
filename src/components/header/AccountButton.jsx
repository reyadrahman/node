import * as actions from '../../actions/actions.js';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Glyphicon, Button, Dropdown, MenuItem } from 'react-bootstrap';

let AccountButton = React.createClass({
    onMenuSelect(eventKey) {
        if (eventKey === 'account') {
            this.props.router.push('/account');
        } else if (eventKey === 'signout') {
            this.props.signout();
        }
    },

    onNameClick() {
        this.props.router.push('/account');
    },

    onSignInClick() {
        this.props.openSignin();
    },

    onSignUpOrVerifyClick(eventKey) {
        if (eventKey === 'signup') {
            this.props.openSignup();
        } else if (eventKey === 'verify') {
            this.props.openVerifyRegistration();
        }
    },

    onToggle(open) {
        console.log('onToggle: ', open);
    },

    render() {
        const { className, styles, styles: { accountButton: ss },
                i18n, i18n: { strings: { accountButton: strings } },
                currentUser } = this.props;

        if (!currentUser || !currentUser.attributes) {
            return (
                <Dropdown
                    className={`${ss.root} ${className || ''}`}
                    onSelect={this.onSignUpOrVerifyClick}
                    pullRight
                >
                    <Button onClick={this.onSignInClick}>
                        { strings.signin }
                    </Button>
                    <Dropdown.Toggle />
                    <Dropdown.Menu>
                        <MenuItem eventKey="signup">
                            <Glyphicon glyph="plus-sign" className={ss.icon} /> { strings.signup }
                        </MenuItem>
                        <MenuItem eventKey="verify">
                            <Glyphicon glyph="ok-circle" className={ss.icon} /> { strings.verifyRegistration }
                        </MenuItem>
                    </Dropdown.Menu>
                </Dropdown>
            );
        }

        return (
            <Dropdown
                className={`${ss.root} ${className || ''}`}
                onSelect={this.onMenuSelect}
                pullRight
                onToggle={this.onToggle}
            >
                <Button onClick={this.onNameClick}>
                    { currentUser.attributes.given_name }
                </Button>
                <Dropdown.Toggle />
                <Dropdown.Menu>
                    <MenuItem eventKey="account">
                        <Glyphicon glyph="user" className={ss.icon} /> { strings.account }
                    </MenuItem>
                    <MenuItem eventKey="signout">
                        <Glyphicon glyph="log-out" className={ss.icon} /> { strings.signout }
                    </MenuItem>
                </Dropdown.Menu>
            </Dropdown>
        );
    },
});

AccountButton = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        openSignin: actions.openSignin,
        openSignup: actions.openSignup,
        openVerifyRegistration: actions.openVerifyRegistration,
        signout: actions.signout,
    }
)(AccountButton);

AccountButton = withRouter(AccountButton);


export default AccountButton;
