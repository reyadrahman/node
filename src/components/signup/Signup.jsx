import React from 'react';
import {connect} from 'react-redux';
import {ModalBox, Input, Button} from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../actions/actions.js';

import styles from './signup.scss';

let Signup = React.createClass({
    render() {
        let {isOpen, i18n: {strings: {signup: strings}},
             errorMessage, successMessage, closeSignup} = this.props;
        let {state} = this;
        return (
            <ModalBox
                isOpen={isOpen}
                onRequestClose={closeSignup}
                title={strings.title}
                successMessage={successMessage}
                errorMessage={errorMessage}
            >
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
                    <Button
                        type="submit"
                        className={styles.signupButton}
                        label={strings.signup}
                    />
                </form>
            </ModalBox>
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

Signup = connect(
    state => ({
        isOpen: state.signup.isOpen,
        errorMessage: state.signup.errorMessage,
        successMessage: state.signup.successMessage,
    }),
    {
        closeSignup: actions.closeSignup,
        signup: actions.signup,
    }
)(Signup);

export default Signup;
