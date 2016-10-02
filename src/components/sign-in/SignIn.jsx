import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Button } from 'react-bootstrap';
import { Form, Input, SuccessMessage, ErrorMessage } from '../form/Form.jsx';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import * as actions from '../../app-state/actions.js';

let SignIn = React.createClass({

    getInitialState() {
        return {
            email: '',
            password: '',
        };
    },

    signIn(e) {
        e.preventDefault();
        console.log('signIn: ', this.state);
        this.props.signIn(this.state.email, this.state.password);
    },

    emailChanged(e) {
        this.setState({ email: e.target.value });
    },
    passwordChanged(e) {
        this.setState({ password: e.target.value });
    },

    render() {
        const { i18n: { strings: { signIn: strings } },
                errorMessage, successMessage } = this.props;
        const { state } = this;

        return (
            <div className="sign-in-modal-comp">
                <Title title={strings.title} />
                <Form
                    onSubmit={this.signIn}
                >
                    <div className="inputs-row">
                        <label>{strings.email}</label>
                        <Input
                            className="field"
                            value={state.email}
                            onChange={this.emailChanged}
                            icon="user"
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.password}</label>
                        <Input
                            className="field"
                            value={state.password}
                            onChange={this.passwordChanged}
                            type="password"
                            icon="lock"
                        />
                    </div>
                    <ErrorMessage message={errorMessage} />
                    <SuccessMessage message={successMessage} />
                    <Button
                        className="button"
                        bsStyle="primary"
                        bsSize='large'
                        type='submit'
                        > { strings.signIn }
                    </Button>
                </Form>
            </div>
        );
    },
});

SignIn = connect(
    state => ({
        errorMessage: state.signIn.errorMessage,
        successMessage: state.signIn.successMessage,
    }),
    {
        signIn: actions.signIn,
    }
)(SignIn);

export default SignIn;
