import { Form, Input, SuccessMessage, ErrorMessage } from '../form/Form.jsx';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../app-state/actions.js';
import { isValidEmail } from '../../misc/utils.js';
import * as E from '../../misc/error-codes.js';
import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Button } from 'react-bootstrap';
const reportDebug = require('debug')('deepiks:SignIn');

let SignIn = React.createClass({

    getInitialState() {
        return {
            email: '',
            password: '',
        };
    },

    signIn(e) {
        e.preventDefault();
        reportDebug('signIn: ', this.state);
        const email = this.state.email.trim();
        if (!isValidEmail(email)) {
            return this.props.signInFailed(E.SIGN_IN_INVALID_EMAIL);
        }
        if (!this.state.password) {
            return this.props.signInFailed(E.SIGN_IN_INVALID_PASSWORD);
        }
        this.props.signIn(email, this.state.password);
    },

    emailChanged(e) {
        this.setState({ email: e.target.value });
    },
    passwordChanged(e) {
        this.setState({ password: e.target.value });
    },

    render() {
        const { i18n: { strings: { errors, signIn: strings } },
                errorCode, signingIn } = this.props;
        const { state } = this;
        const errorMessage = errorCode && (errors[errorCode]);

        return (
            <div className="sign-in-modal-comp">
                <Title title={strings.title} />
                <Form
                    onSubmit={this.signIn}
                >
                    <div className="inputs-row">
                        <label>{strings.email}</label>
                        <Input
                            className="field"
                            value={state.email}
                            onChange={this.emailChanged}
                            icon="user"
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.password}</label>
                        <Input
                            className="field"
                            value={state.password}
                            onChange={this.passwordChanged}
                            type="password"
                            icon="lock"
                        />
                    </div>
                    <ErrorMessage message={errorMessage} />
                    <Button
                        className="button"
                        bsStyle="primary"
                        bsSize='large'
                        type='submit'
                        disabled={signingIn}
                    >
                        { signingIn && <i className="icon-spinner animate-spin"></i> }
                        { ' ' }
                        { strings.signIn }
                    </Button>
                </Form>
            </div>
        );
    },
});

SignIn = connect(
    state => ({
        errorCode: state.signIn.errorCode,
        signingIn: state.signIn.signingIn,
    }),
    {
        signIn: actions.signIn,
        signInFailed: actions.signInFailed,
        signInReset: actions.signInReset,
    }
)(SignIn);

export default SignIn;
