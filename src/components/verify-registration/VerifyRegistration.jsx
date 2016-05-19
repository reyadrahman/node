import React from 'react';
import { connect } from 'react-redux';
import { ModalBox, Input, Button } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../actions/actions.js';

let VerifyRegistration = React.createClass({
    getInitialState() {
        console.log('getInitialState', this.props);
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
                styles, styles: { verifyRegistration: ss },
                errorMessage, successMessage,
                closeVerifyRegistration } = this.props;
        const { state } = this;
        const buttons = [
            { label: strings.verify, type: 'submit' },
        ];

        return (
            <ModalBox
                isOpen={isOpen}
                onRequestClose={closeVerifyRegistration}
                title={strings.title}
                successMessage={successMessage}
                errorMessage={errorMessage}
                styles={styles}
                onSubmit={this.verify}
                buttons={buttons}
            >
                <div className={ss.inputsRow}>
                    <label>{strings.email}</label>
                    <Input
                        className={ss.field}
                        value={state.email}
                        onChange={this.emailChanged}
                        styles={styles}
                    />
                </div>
                <div className={ss.inputsRow}>
                    <label>{strings.code}</label>
                    <Input
                        className={ss.field}
                        value={state.code}
                        onChange={this.verificationCodeChanged}
                        styles={styles}
                    />
                </div>
            </ModalBox>
        );
    },

});

VerifyRegistration = connect(
    state => ({
        isOpen: state.verifyRegistration.isOpen,
        errorMessage: state.verifyRegistration.errorMessage,
        successMessage: state.verifyRegistration.successMessage,
        initialEmail: state.verifyRegistration.initialEmail,
    }),
    {
        closeVerifyRegistration: actions.closeVerifyRegistration,
        verifyRegistration: actions.verifyRegistration,
    }
)(VerifyRegistration);

export default VerifyRegistration;
