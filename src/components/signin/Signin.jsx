import React from 'react';
import { connect } from 'react-redux';
import { ModalBox, Input, Button } from '../modal-box-1/ModalBox1.jsx';
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
        let { isOpen, i18n: { strings: { signin: strings } },
              styles, styles: { signin: ss },
              errorMessage, successMessage, closeSignin } = this.props;
        let { state } = this;
        return (
            <ModalBox
                isOpen={isOpen}
                onRequestClose={closeSignin}
                title={strings.title}
                successMessage={successMessage}
                errorMessage={errorMessage}
                styles={styles}
            >
                <form onSubmit={this.signin}>
                    <div className={ss.inputsRow}>
                        <Input
                            className={ss.field}
                            placeholder={strings.email}
                            value={state.email}
                            onChange={this.emailChanged}
                        />
                        <Input
                            className={ss.field}
                            placeholder={strings.password}
                            value={state.password}
                            onChange={this.passwordChanged}
                            type="password"
                        />
                    </div>
                    <Button
                        type="submit"
                        className={ss.signinButton}
                        label={strings.signin}
                        styles={styles}
                    />
                </form>
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
