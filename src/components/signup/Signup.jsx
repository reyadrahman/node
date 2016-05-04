import React from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import * as actions from '../../actions/actions.js';

import styles from './signup.scss';
console.log('============== ', styles);

let Signup = React.createClass({
    render() {
        let {isOpen, i18n: {strings: {signup: strings}},
             errorMessage, successMessage} = this.props;
        let {state} = this;
        return (
            <Modal
                isOpen={isOpen}
                onAfterOpen={this.afterOpen}
                onRequestClose={this.props.closeSignup}
                className={styles.modalContent}
                overlayClassName={styles.modalOverlay}
            >

                <div
                    className={styles.closeButton}
                    onClick={this.props.closeSignup}
                />
                <h2 className={styles.title}>{strings.title}</h2>
                <form onSubmit={this.signup}>
                    <div className={styles.inputsRow1}>
                        <Input
                            className={styles.field}
                            placeholder={strings.firstName}
                            value={state.firstName}
                            onChange={this.firstNameChanged}
                        />
                        <Input
                            className={styles.field}
                            placeholder={strings.lastName}
                            value={state.lastName}
                            onChange={this.lastNameChanged}
                        />
                    </div>
                    <div className={styles.inputsRow2}>
                        <Input
                            className={styles.field}
                            placeholder={strings.email}
                            value={state.email}
                            onChange={this.emailChanged}
                        />
                        <Input
                            className={styles.field}
                            placeholder={strings.password}
                            type="password"
                            value={state.password}
                            onChange={this.passwordChanged}
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.signupButton}
                    >
                        {strings.signup}
                    </button>
                </form>
                <div className={styles.error}>
                    {errorMessage}
                </div>
                <div className={styles.success}>
                    {successMessage}
                </div>
            </Modal>
        );
    },

    getInitialState() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        };
    },

    signup(e) {
        e.preventDefault();
        console.log('signup: ', this.state);
        this.props.signup(this.state);
    },

    firstNameChanged(e) {
        this.setState({firstName: e.target.value});
    },
    lastNameChanged(e) {
        this.setState({lastName: e.target.value});
    },
    emailChanged(e) {
        this.setState({email: e.target.value});
    },
    passwordChanged(e) {
        this.setState({password: e.target.value});
    }

});

const Input = React.createClass({
    render() {
        let {placeholder, type, className, onChange} = this.props;
        return (
            <input
                type={type || 'text'}
                placeholder={placeholder}
                className={`${styles.input} ${this.props.className || ''}`}
                onChange={onChange}
            />
        );
    }
});

Signup = connect(
    state => ({
        errorMessage: state.signup.errorMessage,
        successMessage: state.signup.successMessage,
    }),
    {
        closeSignup: actions.closeSignup,
        signup: actions.signup,
    }
)(Signup);

export default Signup;
