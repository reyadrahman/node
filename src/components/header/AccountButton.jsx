import * as actions from '../../app-state/actions.js';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Glyphicon, Button, Dropdown, MenuItem } from 'react-bootstrap';

let AccountButton = React.createClass({
    onMenuSelect(eventKey) {
        if (eventKey === 'account') {
            this.props.router.push('/account');
        } else if (eventKey === 'signOut') {
            this.props.signOut();
        }
    },

    onNameClick() {
        this.props.router.push('/account');
    },

    onSignInClick() {
        this.props.openSignIn();
    },

    onSignUpOrVerifyClick(eventKey) {
        if (eventKey === 'signUp') {
            this.props.openSignUp();
        } else if (eventKey === 'verify') {
            this.props.openVerifyRegistration();
        }
    },

    onToggle(open) {

    },

    render() {
        const { className, i18n, i18n: { strings: { accountButton: strings } },
                currentUser } = this.props;

        if (!currentUser || !currentUser.attributes) {
            return (
                <Dropdown
                    className={`account-button-comp ${className || ''}`}
                    onSelect={this.onSignUpOrVerifyClick}
                    pullRight
                >
                    <Button className="sign-in-btn" onClick={this.onSignInClick}>
                        { strings.signIn }
                    </Button>
                    <Dropdown.Toggle className="arrow-btn" />
                    <Dropdown.Menu>
                        <MenuItem eventKey="verify">
                            <Glyphicon glyph="ok-circle" className="icon" /> { strings.verifyRegistration }
                        </MenuItem>
                    </Dropdown.Menu>
                </Dropdown>
            );
        }

        return (
            <Dropdown
                className={`account-button-comp ${className || ''}`}
                onSelect={this.onMenuSelect}
                pullRight
                onToggle={this.onToggle}
            >
                <Button className="account-btn" onClick={this.onNameClick}>
                    { currentUser.attributes.given_name }
                </Button>
                <Dropdown.Toggle className="arrow-btn" />
                <Dropdown.Menu>
                    <MenuItem eventKey="account">
                        <Glyphicon glyph="user" className="icon" /> { strings.account }
                    </MenuItem>
                    <MenuItem eventKey="signOut">
                        <Glyphicon glyph="log-out" className="icon" /> { strings.signOut }
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
        openSignIn: actions.openSignIn,
        openSignUp: actions.openSignUp,
        openVerifyRegistration: actions.openVerifyRegistration,
        signOut: actions.signOut,
    }
)(AccountButton);

AccountButton = withRouter(AccountButton);


export default AccountButton;
