import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import { connect } from 'react-redux';

let BotsPage = React.createClass({
    getInitialState() {
        return {
            botName: '',
            ciscosparkAccessToken: '',
            ciscosparkBotEmail: '',
            messengerPageAccessToken: '',
            microsoftAppId: '',
            microsoftAppPassword: '',
            witAccessToken: '',
        };
    },
    addBot(e) {
        e.preventDefault();
        const { botName, ...settings } = this.state;
        this.props.addBot(botName, settings);
    },
    botNameChanged(e) {
        this.setState({ botName: e.target.value });
    },
    ciscosparkAccessTokenChanged(e) {
        this.setState({ ciscosparkAccessToken: e.target.value });
    },
    ciscosparkBotEmailChanged(e) {
        this.setState({ ciscosparkBotEmail: e.target.value });
    },
    messengerPageAccessTokenChanged(e) {
        this.setState({ messengerPageAccessToken: e.target.value });
    },
    microsoftAppIdChanged(e) {
        this.setState({ microsoftAppId: e.target.value });
    },
    microsoftAppPasswordChanged(e) {
        this.setState({ microsoftAppPassword: e.target.value });
    },
    witAccessTokenChanged(e) {
        this.setState({ witAccessToken: e.target.value });
    },

    componentWillMount() {
        // TODO
        // if (this.props.errorMessage || this.props.successMessage) {
        //     this.props.clearContactsMessages();
        // }
    },

    render() {
        const { className, styles, styles: { addBotPage: ss },
                i18n: { strings: { addBot: strings } },
                successMessage, errorMessage } = this.props;
        const { state } = this;

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <h2 className={ss.title}>{strings.title}</h2>
                <Form
                    className={ss.form}
                    onSubmit={this.addBot}
                    styles={styles}
                >
                    <div className={ss.inputsRow}>
                        <label>{strings.botName}</label>
                        <Input
                            className={ss.field}
                            value={state.botName}
                            onChange={this.botNameChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <label>{strings.ciscosparkAccessToken}</label>
                        <Input
                            className={ss.field}
                            value={state.ciscosparkAccessToken}
                            onChange={this.ciscosparkAccessTokenChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <label>{strings.ciscosparkBotEmail}</label>
                        <Input
                            className={ss.field}
                            value={state.ciscosparkBotEmail}
                            onChange={this.ciscosparkBotEmailChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <label>{strings.messengerPageAccessToken}</label>
                        <Input
                            className={ss.field}
                            value={state.messengerPageAccessToken}
                            onChange={this.messengerPageAccessTokenChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <label>{strings.microsoftAppId}</label>
                        <Input
                            className={ss.field}
                            value={state.microsoftAppId}
                            onChange={this.microsoftAppIdChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <label>{strings.microsoftAppPassword}</label>
                        <Input
                            className={ss.field}
                            value={state.microsoftAppPassword}
                            onChange={this.microsoftAppPasswordChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.inputsRow}>
                        <label>{strings.witAccessToken}</label>
                        <Input
                            className={ss.field}
                            value={state.witAccessToken}
                            onChange={this.witAccessTokenChanged}
                            styles={styles}
                        />
                    </div>
                    <div className={ss.messages}>
                        <ErrorMessage message={errorMessage} styles={styles} />
                        <SuccessMessage className={ss.success} message={successMessage} styles={styles} />
                    </div>
                    <div className={ss.buttonArea}>
                        <Button
                            className={ss.addBotButton}
                            label={strings.addBot}
                            type="submit"
                            styles={styles}
                        />
                    </div>
                </Form>
            </div>
        );
    }
});

BotsPage = connect(
    state => ({
        currentUser: state.currentUser,
        successMessage: state.addBotSuccessMessage,
        successMessage: state.addBotErrorMessage,
    }),
    {
        addBot: actions.addBot,
    }
)(BotsPage);

export default BotsPage;
