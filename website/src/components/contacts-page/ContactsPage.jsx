import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import { connect } from 'react-redux';

let ContactsPage = React.createClass({
    getInitialState() {
        const { currentUser } = this.props;
        console.log('ContactsPage: ', currentUser);
        return {
            name: currentUser && `${currentUser.given_name} ${currentUser.family_name}`.trim() || '',
            email: currentUser && currentUser.email || '',
            subject: '',
            message: '',
        };
    },
    send(e) {
        e.preventDefault();
        const { name, email, subject, message } = this.state;
        console.log('send: ', this.state);
        // if (!name || !lastName || !email || !subject || !message) {
        //     console.log('some field is empty');
        //     return;
        // }


        this.props.sendEmail({ name, email, subject, message });
    },
    nameChanged(e) {
        this.setState({ name: e.target.value });
    },
    emailChanged(e) {
        this.setState({ email: e.target.value });
    },
    subjectChanged(e) {
        this.setState({ subject: e.target.value });
    },
    messageChanged(e) {
        this.setState({ message: e.target.value });
    },

    componentWillMount() {
        if (this.props.errorMessage || this.props.successMessage) {
            this.props.clearContactsMessages();
        }
    },

    componentWillReceiveProps(newProps) {
        const { currentUser } = newProps;
        this.setState({
            name: this.state.name || currentUser && `${currentUser.given_name} ${currentUser.family_name}`.trim() || '',
            email: this.state.email || currentUser && currentUser.email || '',
        });
    },

    render() {
        const { className, styles, styles: { contactsPage: ss },
                i18n: { strings: { contacts: strings } },
                successMessage, errorMessage } = this.props;
        const { state } = this;

        console.log('ContactsPage: ', state.name, state.email);

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <h2 className={ss.title}>{strings.title}</h2>
                <Form
                    className={ss.form}
                    onSubmit={this.send}
                    styles={styles}
                >
                    <div className={ss.inputsRow}>
                        <label>{strings.name}</label>
                        <Input
                            className={ss.field}
                            value={state.name}
                            onChange={this.nameChanged}
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
                    <div className={ss.messages}>
                        <ErrorMessage message={errorMessage} styles={styles} />
                        <SuccessMessage className={ss.success} message={successMessage} styles={styles} />
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

ContactsPage = connect(
    state => ({
        errorMessage: state.contacts.errorMessage,
        successMessage: state.contacts.successMessage,
        currentUser: state.currentUser,
    }),
    {
        sendEmail: actions.sendEmail,
        clearContactsMessages: actions.clearContactsMessages,
    }
)(ContactsPage);

export default ContactsPage;
