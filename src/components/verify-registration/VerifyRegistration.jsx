import React from 'react';
import {connect} from 'react-redux';
import {ModalBox, Input, Button} from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../actions/actions.js';

import styles from './verify-registration.scss';

let VerifyRegistration = React.createClass({
    render() {
        let {isOpen, i18n: {strings: {verifyRegistration: strings}},
             errorMessage, successMessage,
             closeVerifyRegistration} = this.props;
        let {state} = this;
        return (
            <ModalBox
                isOpen={isOpen}
                onRequestClose={closeVerifyRegistration}
                title={strings.title}
                successMessage={successMessage}
                errorMessage={errorMessage}
            >
                <form onSubmit={this.verify}>
                    <Input
                        className={styles.verificationCodeInput}
                        placeholder={strings.inputPlaceholder}
                        value={state.verificationCode}
                        onChange={this.verificationCodeChanged}
                    />
                    <Button
                        type="submit"
                        className={styles.verifyButton}
                        label={strings.verify}
                    />
                </form>
            </ModalBox>
        );
    },

    getInitialState() {
        return {
            verificationCode: '',
        };
    },

    verify(e) {
        e.preventDefault();
        console.log('verify: ', this.state);
        this.props.verifyRegistration(this.state.verificationCode);
    },

    verificationCodeChanged(e) {
        this.setState({verificationCode: e.target.value});
    }

});

VerifyRegistration = connect(
    state => ({
        isOpen: state.verifyRegistration.isOpen,
        errorMessage: state.verifyRegistration.errorMessage,
        successMessage: state.verifyRegistration.successMessage,
    }),
    {
        closeVerifyRegistration: actions.closeVerifyRegistration,
        verifyRegistration: actions.verifyRegistration,
    }
)(VerifyRegistration);

export default VerifyRegistration;
