import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../app-state/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

let AddBotPage = React.createClass({
    getInitialState() {
        return {
            botName: '',
            ciscosparkAccessToken: '',
            messengerPageAccessToken: '',
            messengerAppSecret: '',
            microsoftAppId: '',
            microsoftAppPassword: '',
            witAccessToken: '',
            twitterConsumerKey: '',
            twitterConsumerSecret: '',
        };
    },
    addBot(e) {
        console.log('AddBotPage: addBot');
        e.preventDefault();
        const { botName, ...settings } = this.state;
        this.props.addBot(botName, settings).then(() => {
            this.props.router.push('/account');
        });
    },
    cancel(e) {
        console.log('AddBotPage: cancel');
        e.preventDefault();
        this.props.router.goBack();
    },
    botNameChanged(e) {
        this.setState({ botName: e.target.value });
    },
    ciscosparkAccessTokenChanged(e) {
        this.setState({ ciscosparkAccessToken: e.target.value });
    },
    messengerPageAccessTokenChanged(e) {
        this.setState({ messengerPageAccessToken: e.target.value });
    },
    messengerAppSecretChanged(e) {
        this.setState({ messengerAppSecret: e.target.value });
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
    twitterConsumerKeyChanged(e) {
        this.setState({ twitterConsumerKey: e.target.value });
    },
    twitterConsumerSecretChanged(e) {
        this.setState({ twitterConsumerSecret: e.target.value });
    },

    componentWillMount() {
    },

    render() {
        const { className, i18n: { strings: { addBot: strings } },
                currentUser, successMessage, errorMessage } = this.props;
        const { state } = this;

        if (!currentUser || !currentUser.attributes || !currentUser.attributes.sub) {
            return <h3>Please log in</h3>;
        }


        return (
            <div className={`add-bot-page-comp ${className || ''}`}>
                <h2 className="title">{strings.title}</h2>
                <Form
                    className="form"
                    onSubmit={this.addBot}
                >
                    <div className="inputs-row">
                        <label>{strings.botName}</label>
                        <Input
                            className="field"
                            value={state.botName}
                            onChange={this.botNameChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.ciscosparkAccessToken}</label>
                        <Input
                            className="field"
                            value={state.ciscosparkAccessToken}
                            onChange={this.ciscosparkAccessTokenChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.messengerPageAccessToken}</label>
                        <Input
                            className="field"
                            value={state.messengerPageAccessToken}
                            onChange={this.messengerPageAccessTokenChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.messengerAppSecret}</label>
                        <Input
                            className="field"
                            value={state.messengerAppSecret}
                            onChange={this.messengerAppSecretChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.microsoftAppId}</label>
                        <Input
                            className="field"
                            value={state.microsoftAppId}
                            onChange={this.microsoftAppIdChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.microsoftAppPassword}</label>
                        <Input
                            className="field"
                            value={state.microsoftAppPassword}
                            onChange={this.microsoftAppPasswordChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.witAccessToken}</label>
                        <Input
                            className="field"
                            value={state.witAccessToken}
                            onChange={this.witAccessTokenChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.twitterConsumerKey}</label>
                        <Input
                            className="field"
                            value={state.twitterConsumerKey}
                            onChange={this.twitterConsumerKeyChanged}
                        />
                    </div>
                    <div className="inputs-row">
                        <label>{strings.twitterConsumerSecret}</label>
                        <Input
                            className="field"
                            value={state.twitterConsumerSecret}
                            onChange={this.twitterConsumerSecretChanged}
                        />
                    </div>
                    <div className="messages">
                        <ErrorMessage message={errorMessage} />
                        <SuccessMessage className="success" message={successMessage} />
                    </div>
                    <div className="button-area">
                        <Button
                            className="cancel-button"
                            label={strings.cancel}
                            onClick={this.cancel}
                        />
                        <Button
                            className="add-bot-button"
                            label={strings.addBot}
                            type="submit"
                        />
                    </div>
                </Form>
            </div>
        );
    }
});

AddBotPage = connect(
    state => ({
        currentUser: state.currentUser,
        successMessage: state.addBotSuccessMessage,
        errorMessage: state.addBotErrorMessage,
    }),
    {
        addBot: actions.addBot,
    }
)(AddBotPage);

AddBotPage = withRouter(AddBotPage);

export default AddBotPage;
