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
                    <div className={styles.inputsRow}>
                        <Input
                            className={styles.field}
                            placeholder={strings.email}
                            value={state.email}
                            onChange={this.emailChanged}
                        />
                        <Input
                            className={styles.field}
                            placeholder={strings.code}
                            value={state.code}
                            onChange={this.verificationCodeChanged}
                        />
                    </div>
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
        console.log('getInitialState', this.props);
        return {
            code: '',
            email: this.props.initialEmail || '',
        };
    },

    verify(e) {
        let {email, code} = this.state;
        e.preventDefault();
        console.log('verify: ', this.state);
        this.props.verifyRegistration({email, code});
    },

    emailChanged(e) {
        this.setState({email: e.target.value});
    },

    verificationCodeChanged(e) {
        this.setState({code: e.target.value});
    },

    componentWillReceiveProps(newProps) {
        console.log('componentWillReceiveProps', this.props, newProps);
        if (newProps.initialEmail !== this.props.initialEmail) {
            console.log('!!!');
            this.setState({email: newProps.initialEmail});
        }
    }

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
