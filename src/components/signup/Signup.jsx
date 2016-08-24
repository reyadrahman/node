import React from 'react';
import { connect } from 'react-redux';
import { ModalBox } from '../modal-box-1/ModalBox1.jsx';
import { Form, Input, SuccessMessage, ErrorMessage } from '../form/Form.jsx';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../actions/actions.js';

let Signup = React.createClass({
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
        const { isOpen, i18n: { strings: { signup: strings } },
                styles, styles: { signup: ss },
                errorMessage, successMessage, closeSignup } = this.props;
        const { state } = this;
        const buttons = [
            { label: strings.signup, type: 'submit' },
        ];


        return (
            <div>
                <Title styles={styles} title={strings.title} />
                <Form
                    onSubmit={this.signup}
                    buttons={buttons}
                    styles={styles}
                >
                    <div className={ss.inputsRow}>
                        <label>{strings.firstName}</label>
                        <Input
                            className={ss.field}
                            value={state.firstName}
                            onChange={this.firstNameChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <label>{strings.lastName}</label>
                        <Input
                            className={ss.field}
                            value={state.lastName}
                            onChange={this.lastNameChanged}
                            styles={styles}
                        />
                    </div>
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
                        <label>{strings.password}</label>
                        <Input
                            className={ss.field}
                            type="password"
                            value={state.password}
                            onChange={this.passwordChanged}
                            styles={styles}
                        />
                    </div>
                    <ErrorMessage message={errorMessage} styles={styles} />
                    <SuccessMessage message={successMessage} styles={styles} />
                </Form>
            </div>
        );
    },
});

Signup = connect(
    state => ({
        errorMessage: state.signup.errorMessage,
        successMessage: state.signup.successMessage,
    }),
    {
        signup: actions.signup,
    }
)(Signup);

export default Signup;
