import React from 'react';
import { Form, Input, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import { Button } from 'react-bootstrap';
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
            dashbotFacebookKey: '',
            dashbotGenericKey: '',
        };
    },
    addBot(e) {
        e.preventDefault();
        const { botName, ...settings } = this.state;
        this.props.addBot(botName, settings)
            .then(() => {
                this.props.fetchBots();
                this.props.router.goBack();
            })
            .catch(()=>{});
    },
    cancel(e) {
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
    dashbotFacebookKeyChanged(e) {
        this.setState({ dashbotFacebookKey: e.target.value });
    },
    dashbotGenericKeyChanged(e) {
        this.setState({ dashbotGenericKey: e.target.value });
    },

    componentWillMount() {
        this.props.resetAddBotState();
    },

    render() {
        const { className, i18n: { strings: { errors, successes, addBot: strings } },
                currentUser, currentUser: { addBotState: { successCode, errorCode } }
        } = this.props;
        const { state } = this;

        if (!currentUser.signedIn) return;

        return (
            <div className={`add-bot-page-comp ${className || ''}`}>
                <div className="add-bot-section">
                    <h1 className="title">{strings.title}</h1>
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
                        <div className="inputs-row">
                            <label>{strings.dashbotFacebookKey}</label>
                            <Input
                                className="field"
                                value={state.dashbotFacebookKey}
                                onChange={this.dashbotFacebookKeyChanged}
                            />
                        </div>
                        <div className="inputs-row">
                            <label>{strings.dashbotGenericKey}</label>
                            <Input
                                className="field"
                                value={state.dashbotGenericKey}
                                onChange={this.dashbotGenericKeyChanged}
                            />
                        </div>
                        <div className="messages">
                            <ErrorMessage message={errors[errorCode]} />
                            <SuccessMessage className="success" message={successes[successCode]} />
                        </div>
                        <div className="button-area">
                            <Button
                                className="button"
                                bsSize="large"
                                onClick={this.cancel}
                                > {strings.cancel}
                            </Button>
                            <Button
                                className="button"
                                bsStyle="primary"
                                bsSize="large"
                                type="submit"
                                > { strings.addBot}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
});

AddBotPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        addBot: actions.addBot,
        fetchBots: actions.fetchBots,
        resetAddBotState: actions.resetAddBotState,
    }
)(AddBotPage);

AddBotPage = withRouter(AddBotPage);

export default AddBotPage;
