import React from 'react';
import {Button, Alert, FormGroup, ControlLabel, FormControl, Checkbox, Col, Form, Tabs, Tab} from 'react-bootstrap';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import {CONSTANTS} from '../../client/client-utils';

const reportDebug = require('debug')('deepiks:BotSettingsPage');
const reportError = require('debug')('deepiks:BotSettingsPage:error');

import _ from 'lodash';

let BotSettingsPage = React.createClass({
    getInitialState() {
        return {
            bot: null
        }
    },

    setBot() {
        const user = this.props.currentUser;

        if (user.botsState.hasFetched) {
            if (user.selectedBotId && (!this.state.bot || this.state.bot.botId !== user.selectedBotId)) {
                let bot = _.cloneDeep(_.find(user.botsState.bots, {botId: user.selectedBotId}));
                bot     = _.merge({
                    settings: {
                        secretWebchatCode: null,
                        dashbotId:         null
                    }
                }, bot);

                this.setState({bot});
            }
        } else if (user.botsState.errorMessage) {
            if (this.state.error !== user.botsState.errorMessage) {
                this.setState({error: user.botsState.errorMessage})
            }
        }
    },

    componentDidMount() {
        if (!this.props.currentUser.signedIn) {
            return;
        }

        this.setBot();
    },

    componentDidUpdate(oldProps) {
        if (!this.props.currentUser.signedIn) {
            return;
        }

        this.setBot();
    },

    onFormFieldChange(e) {
        let bot   = this.state.bot;
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        if (value === '') {value = null}

        if (e.target.id.indexOf('_') === -1) {
            bot[e.target.id] = value;
        } else {
            let [attribute, key] = e.target.id.split('_');
            bot[attribute][key]  = value;
        }

        this.setState({bot});
    },

    async save(e) {
        e.preventDefault();

        this.setState({busy: true});

        let bot = this.state.bot;

        let saved = await this.props.updateBot(bot.botId, bot);

        let bots = _.cloneDeep(this.props.currentUser.botsState.bots);
        for (let i = 0; i < bots.length; i += 1) {
            if (bots[i].botId === saved.botId) {
                bots[i] = saved;
                break;
            }
        }
        this.props.setBots(bots);

        this.setState({saved: true, busy: false});
        setTimeout(() => {this.setState({saved: null})}, 2000);
    },

    render() {
        const bot = this.state.bot;
        let content;
        let alert = null;

        const hooks = {
            'ciscospark': 'spark',
            'messenger': 'messenger',
            'microsoft': 'ms'
        };

        if (bot) {
            const baseUrl = `${CONSTANTS.OWN_BASE_URL}/webhooks/` +
                            `${bot.publisherId}/${bot.botId}/`;
            content = (
                <Form horizontal>
                    <FormGroup controlId="botName">
                        <Col componentClass={ControlLabel} sm={2}>
                            Name
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="text"
                                value={bot.botName}
                                placeholder="Bot Name"
                                onChange={this.onFormFieldChange}
                            />
                        </Col>

                    </FormGroup>

                    <FormGroup controlId="botIcon">
                        <Col componentClass={ControlLabel} sm={2}>
                            Icon
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="text"
                                value={bot.botIcon}
                                placeholder="Bot Icon"
                                onChange={this.onFormFieldChange}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="defaultLanguage">
                        <Col componentClass={ControlLabel} sm={2}>
                            Default language
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                componentClass="select"
                                placeholder="select"
                                value={bot.defaultLanguage}
                                onChange={this.onFormFieldChange}
                            >
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                            </FormControl>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="onlyAllowedUsersCanChat">
                        <Col smOffset={2} sm={10}>
                            <Checkbox
                                id="onlyAllowedUsersCanChat"
                                checked={!!bot.onlyAllowedUsersCanChat}
                                onChange={this.onFormFieldChange}
                            >Only allowed users can chat with bot</Checkbox>
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="isPublic">
                        <Col smOffset={2} sm={10}>
                            <Checkbox
                                id="isPublic"
                                checked={!!bot.isPublic}
                                onChange={this.onFormFieldChange}
                            >Make this bot visible on the web</Checkbox>
                        </Col>
                    </FormGroup>

                    <div>
                        <h2>Channel specific settings</h2>
                        <Tabs defaultActiveKey={1}>
                            {[
                                'ciscospark',
                                'dashbot',
                                'messenger',
                                'microsoft',
                                'wit',
                                {prefix: 'secret', title: 'web chat'}
                            ].map((settingsGroup, index) => {
                                let settings = [];
                                if (_.isString(settingsGroup)) {
                                    settingsGroup = {prefix: settingsGroup, title: settingsGroup};
                                }
                                _.forEach(bot.settings, (value, key) => {
                                    if (key.indexOf(settingsGroup.prefix) === 0) {
                                        settings.push(
                                            <FormGroup controlId={'settings_' + key}>
                                                <Col componentClass={ControlLabel} sm={3}>
                                                    {key}
                                                </Col>
                                                <Col sm={9}>
                                                    <FormControl
                                                        type="text"
                                                        value={bot.settings[key]}
                                                        placeholder={key}
                                                        onChange={this.onFormFieldChange}
                                                    />
                                                </Col>
                                            </FormGroup>
                                        );
                                    }
                                });

                                if (settingsGroup.prefix in hooks) {
                                    settings.push(
                                            <FormGroup>
                                                <Col componentClass={ControlLabel} sm={3}>
                                                    Webhook
                                                </Col>
                                                <Col sm={9}>
                                                    <div style={{paddingTop: '7px'}}>
                                                        { baseUrl + hooks[settingsGroup.prefix] }
                                                    </div>
                                                </Col>
                                            </FormGroup>
                                    );
                                }

                                if (settingsGroup.prefix === 'secret') {
                                    let publicBotUrl = `${CONSTANTS.OWN_BASE_URL}/bot/${bot.publisherId}/${bot.botId}`;

                                    settings.push(
                                        <FormGroup>
                                            <Col componentClass={ControlLabel} sm={3}>
                                                Bot public url
                                            </Col>
                                            <Col sm={9}>
                                                <div style={{paddingTop: '7px'}}>
                                                    <Link to={publicBotUrl}>{publicBotUrl}</Link>
                                                </div>
                                            </Col>
                                        </FormGroup>
                                    );
                                }

                                return <Tab eventKey={index + 1} title={settingsGroup.title}>{settings}</Tab>
                            })}
                        </Tabs>
                    </div>
                </Form>
            );
        } else {
            if (this.state.error) {
                content = <Alert bsStyle="danger">{this.state.error}</Alert>;
            } else {
                content = <div className="spinner"><i className="icon-spinner animate-spin"/></div>;
            }
        }

        if (this.state.saved) {
            alert = <Alert bsStyle="success">Settings saved</Alert>;
        }

        return (
            <div className={`bot-settings-page-comp ${this.props.className}`}>
                <div className="panel">
                    <div className="panel-heading">
                        <h1>Edit bot settings</h1>
                    </div>

                    <div className="panel-body">
                        {content}
                    </div>

                    <div className="panel-footer">
                        <div className="row">
                            <div className="col-xs-4"/>
                            <div className="col-xs-4 submit-alert">
                                {alert}
                            </div>
                            <div className="col-xs-4 text-right">
                                <Button onClick={this.save} bsStyle="primary" disabled={this.state.busy}>
                                    Save Bot Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

BotSettingsPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        updateBot: actions.updateBot,
        setBots:   actions.setBots
    }
)(BotSettingsPage);

BotSettingsPage = withRouter(BotSettingsPage);

export default BotSettingsPage;
