import React from 'react';
import { connect } from 'react-redux';
import { ModalBox } from '../modal-box-1/ModalBox1.jsx';
import { Form, Input, SuccessMessage, ErrorMessage } from '../form/Form.jsx';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../actions/actions.js';

let VerifyRegistration = React.createClass({
    getInitialState() {
        return {
            code: '',
            email: this.props.initialEmail || '',
        };
    },

    verify(e) {
        let { email, code } = this.state;
        e.preventDefault();
        console.log('verify: ', this.state);
        this.props.verifyRegistration({ email, code });
    },

    emailChanged(e) {
        this.setState({ email: e.target.value });
    },

    verificationCodeChanged(e) {
        this.setState({ code: e.target.value });
    },

    componentWillReceiveProps(newProps) {
        console.log('componentWillReceiveProps', this.props, newProps);
        if (newProps.initialEmail !== this.props.initialEmail) {
            console.log('!!!');
            this.setState({ email: newProps.initialEmail });
        }
    },

    render() {
        const { isOpen, i18n: { strings: { verifyRegistration: strings } },
                errorMessage, successMessage,
                closeVerifyRegistration } = this.props;
        const { state } = this;
        const buttons = [
            { label: strings.verify, type: 'submit' },
        ];

        return (
            <div>
                <Title title={strings.title} />
                <Form
                    onSubmit={this.verify}
                    buttons={buttons}
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
                    <SuccessMessage message={successMessage} />
                </Form>
            </div>
        );
    },

});

VerifyRegistration = connect(
    state => ({
        errorMessage: state.verifyRegistration.errorMessage,
        successMessage: state.verifyRegistration.successMessage,
        initialEmail: state.verifyRegistration.initialEmail,
    }),
    {
        verifyRegistration: actions.verifyRegistration,
    }
)(VerifyRegistration);

export default VerifyRegistration;
