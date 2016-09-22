import React from 'react';
import { connect } from 'react-redux';
import { ModalBox } from '../modal-box-1/ModalBox1.jsx';
import { Form, Input, SuccessMessage, ErrorMessage } from '../form/Form.jsx';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../app-state/actions.js';

let SignUp = React.createClass({
    getInitialState() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        };
    },

    signUp(e) {
        e.preventDefault();
        console.log('signUp: ', this.state);
        const { firstName, lastName, email, password } = this.state;
        this.props.signUp(firstName, lastName, email, password);
    },

    firstNameChanged(e) {
        this.setState({ firstName: e.target.value });
    },
    lastNameChanged(e) {
        this.setState({ lastName: e.target.value });
    },
    emailChanged(e) {
        this.setState({ email: e.target.value });
    },
    passwordChanged(e) {
        this.setState({ password: e.target.value });
    },

    render() {
        const { isOpen, i18n: { strings: { signUp: strings } },
                errorMessage, successMessage, closeSignUp } = this.props;
        const { state } = this;
        const buttons = [
            { label: strings.signUp, type: 'submit' },
        ];


        return (
            <div className="sign-up-comp">
                <Title title={strings.title} />
                <Form
                    onSubmit={this.signUp}
                    buttons={buttons}
                >
                    <div className="inputs-row">
                        <label>{strings.firstName}</label>
                        <Input
                            className="field"
                            value={state.firstName}
                            onChange={this.firstNameChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.lastName}</label>
                        <Input
                            className="field"
                            value={state.lastName}
                            onChange={this.lastNameChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.email}</label>
                        <Input
                            className="field"
                            value={state.email}
                            onChange={this.emailChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.password}</label>
                        <Input
                            className="field"
                            type="password"
                            value={state.password}
                            onChange={this.passwordChanged}
                        />
                    </div>
                    <ErrorMessage message={errorMessage} />
                    <SuccessMessage message={successMessage} />
                </Form>
            </div>
        );
    },
});

SignUp = connect(
    state => ({
        errorMessage: state.signUp.errorMessage,
        successMessage: state.signUp.successMessage,
    }),
    {
        signUp: actions.signUp,
    }
)(SignUp);

export default SignUp;