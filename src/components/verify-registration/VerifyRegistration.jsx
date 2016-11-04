import { ModalBox } from '../modal-box-1/ModalBox1.jsx';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../app-state/actions.js';
import { isValidEmail } from '../../misc/utils.js';
import * as E from '../../misc/error-codes.js';
import { Form, Input, SuccessMessage, ErrorMessage } from '../form/Form.jsx';
import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
const reportDebug = require('debug')('deepiks:VerifyRegistration');

let VerifyRegistration = React.createClass({
    getInitialState() {
        return {
            code: '',
            email: this.props.initialEmail || '',
        };
    },

    verify(e) {
        e.preventDefault();
        reportDebug('verify: ', this.state);
        const email = this.state.email.trim();
        if (!isValidEmail(email)) {
            return this.props.verifyRegistrationFailed(E.VERIFY_REGISTRATION_INVALID_EMAIL);
        }
        const code = this.state.code;
        if (!code) {
            return this.props.verifyRegistrationFailed(E.VERIFY_REGISTRATION_INVALID_CODE);
        }
        this.props.verifyRegistration({ email, code });
    },

    emailChanged(e) {
        this.setState({ email: e.target.value });
    },

    verificationCodeChanged(e) {
        this.setState({ code: e.target.value });
    },

    componentWillReceiveProps(newProps) {
        if (newProps.initialEmail !== this.props.initialEmail) {
            this.setState({ email: newProps.initialEmail });
        }
    },

    render() {
        const { isOpen, i18n: { strings: { errors, verifyRegistration: strings } },
                errorCode, successCode,
                closeVerifyRegistration } = this.props;
        const { state } = this;
        const errorMessage = errorCode && errors[errorCode];

        return (
            <div>
                <Title title={strings.title} />
                <Form
                    onSubmit={this.verify}
                >
                    <div className="inputs-row">
                        <label>{strings.email}</label>
                        <Input
                            className="field"
                            value={state.email}
                            onChange={this.emailChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.code}</label>
                        <Input
                            className="field"
                            value={state.code}
                            onChange={this.verificationCodeChanged}
                        />
                    </div>
                    <ErrorMessage message={errorMessage} />
                    <SuccessMessage message={successCode} />
                    <Button
                        className="button"
                        bsStyle="primary"
                        bsSize='large'
                        type='submit'
                        > { strings.verify }
                    </Button>
                </Form>
            </div>
        );
    },

});

VerifyRegistration = connect(
    state => ({
        errorCode: state.verifyRegistration.errorCode,
        successCode: state.verifyRegistration.successCode,
        initialEmail: state.verifyRegistration.initialEmail,
    }),
    {
        verifyRegistration: actions.verifyRegistration,
        verifyRegistrationFailed: actions.verifyRegistrationFailed,
    }
)(VerifyRegistration);

export default VerifyRegistration;
