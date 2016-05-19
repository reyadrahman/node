import React from 'react';
import { connect } from 'react-redux';
import { ModalBox, Input, Button, ButtonArea } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../actions/actions.js';

let Signin = React.createClass({

    getInitialState() {
        return {
            email: '',
            password: '',
        };
    },

    signin(e) {
        e.preventDefault();
        console.log('signin: ', this.state);
        this.props.signin(this.state);
    },

    emailChanged(e) {
        this.setState({ email: e.target.value });
    },
    passwordChanged(e) {
        this.setState({ password: e.target.value });
    },

    render() {
        const { isOpen, i18n: { strings: { signin: strings } },
                styles, styles: { signin: ss },
                errorMessage, successMessage, closeSignin } = this.props;
        const { state } = this;
        const buttons = [
            { label: strings.signin, type: 'submit' },
        ];



        return (
            <ModalBox
                isOpen={isOpen}
                onRequestClose={closeSignin}
                title={strings.title}
                successMessage={successMessage}
                errorMessage={errorMessage}
                styles={styles}
                onSubmit={this.signin}
                buttons={buttons}
            >
                <div className={ss.inputsRow}>
                    <label>{strings.email}</label>
                    <Input
                        className={ss.field}
                        value={state.email}
                        onChange={this.emailChanged}
                        styles={styles}
                        icon="icon-user"
                    />
                </div>
                <div className={ss.inputsRow}>
                    <label>{strings.password}</label>
                    <Input
                        className={ss.field}
                        value={state.password}
                        onChange={this.passwordChanged}
                        type="password"
                        styles={styles}
                        icon="icon-lock"
                    />
                </div>
            </ModalBox>
        );
    },
});

Signin = connect(
    state => ({
        isOpen: state.signin.isOpen,
        errorMessage: state.signin.errorMessage,
        successMessage: state.signin.successMessage,
    }),
    {
        closeSignin: actions.closeSignin,
        signin: actions.signin,
    }
)(Signin);

export default Signin;
