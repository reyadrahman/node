import React from 'react';
import { Form, Input, Button, TextArea } from '../form/Form.jsx';

const ContactsPage = React.createClass({
    getInitialState() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            subject: '',
        };
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
    subjectChanged(e) {
        this.setState({ subject: e.target.value });
    },
    render() {
        const { className, styles, styles: { contactsPage: ss },
                i18n: { strings: { contacts: strings } },
                successMessage, errorMessage } = this.props;
        const { state } = this;
        // const buttons = [
        //     { label: strings.send, type: 'submit' },
        // ];

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <h2 className={ss.title}>{strings.title}</h2>
                <Form
                    className={ss.form}
                    successMessage={successMessage}
                    errorMessage={errorMessage}
                    onSubmit={this.signup}
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
                        <label>{strings.subject}</label>
                        <Input
                            className={ss.field}
                            value={state.subject}
                            onChange={this.subjectChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <TextArea
                            className={ss.field}
                            placeholder={strings.message}
                            value={state.message}
                            onChange={this.messageChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.buttonArea}>
                        <Button
                            className={ss.sendButton}
                            label={strings.send}
                            type="submit"
                            styles={styles}
                        />
                    </div>
                </Form>
            </div>
        );
    }
});

export default ContactsPage;
