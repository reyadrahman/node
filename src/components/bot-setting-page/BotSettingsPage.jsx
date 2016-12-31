import * as actions from '../../app-state/actions.js';
import {withRouter, Link} from 'react-router';
import {CONSTANTS} from '../../client/client-utils';
import * as E from '../../misc/error-codes.js';
import * as S from '../../misc/success-codes.js';

import {connect} from 'react-redux';
import React from 'react';
import {Button, Alert, FormGroup, ControlLabel, FormControl, Checkbox, Col, Form, Tabs, Tab} from 'react-bootstrap';

const reportDebug = require('debug')('deepiks:BotSettingsPage');
const reportError = require('debug')('deepiks:BotSettingsPage:error');

import _ from 'lodash';

let BotSettingsPage = React.createClass({
    getInitialState() {
        return {
            bot:   null,
            errorCode: '',
        }
    },

    setBot() {
        const user = this.props.currentUser;

        if (user.botsState.hasFetched) {
            if (user.selectedBotId && (!this.state.bot || this.state.bot.botId !== user.selectedBotId)) {
                let bot = _.cloneDeep(_.find(user.botsState.bots, {botId: user.selectedBotId}));
                this.setState({bot});
            }
        } else if (user.botsState.errorCode) {
            if (this.state.errorCode !== user.botsState.errorCode) {
                this.setState({errorCode: user.botsState.errorCode})
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

        this.setState({busy: true, errorCode: ''});

        let bot = this.state.bot;

        try {
            let saved = await this.props.updateBot(bot.botId, bot);

            let bots = _.cloneDeep(this.props.currentUser.botsState.bots);
            for (let i = 0; i < bots.length; i += 1) {
                if (bots[i].botId === saved.botId) {
                    bots[i] = saved;
                    break;
                }
            }
            this.props.setBots(bots);

            this.setState({saved: true});
            setTimeout(() => {this.setState({saved: null})}, 2000);
        } catch (e) {
            this.setState({errorCode: e.code || E.UPDATE_BOT_GENERAL});
        } finally {
            this.setState({busy: false});
        }
    },

    render() {
        const {className, i18n: {strings: {errors}}} = this.props;

        const bot = this.state.bot;
        let content;
        let alert = null;

        if (bot) {
            const webHookBaseUrl = `${CONSTANTS.OWN_BASE_URL}/webhooks/` +
                            `${bot.publisherId}/${bot.botId}/`;

            let publicBotUrl = `${CONSTANTS.OWN_BASE_URL}/bot/${bot.publisherId}/${bot.botId}`;

            let ownDomain = (CONSTANTS.OWN_BASE_URL.match(/^https?:\/\/([^:/]+):?/, '$1') || [])[1] || 'yourdomain.com';
            let botEmail  = bot.botId + '@' + (bot.settings.emailDomainName || ownDomain);


            let tabs = [
                {
                    name:     'Ciscopark',
                    sections: [
                        {
                            label:     'Ciscospark Access Token',
                            attribute: 'ciscosparkAccessToken'
                        }
                    ]
                },
                {
                    name:     'Messenger',
                    sections: [
                        {
                            label:     'Messenger App Secret',
                            attribute: 'messengerAppSecret'
                        },
                        {
                            label:     'Messenger Page Access Token',
                            attribute: 'messengerPageAccessToken'
                        },
                        {
                            label: 'Webhook',
                            value: webHookBaseUrl + 'messenger'
                        }
                    ]
                },
                {
                    name:     'Microsoft',
                    sections: [
                        {
                            label:     'Microsoft App ID',
                            attribute: 'microsoftAppId'
                        },
                        {
                            label:     'Microsoft App Password',
                            attribute: 'microsoftAppPassword'
                        },
                        {
                            label: 'Webhook',
                            value: webHookBaseUrl + 'ms'
                        }
                    ]
                },
                {
                    name:     'Web Chat',
                    sections: [
                        {
                            label: 'Bot Public Url',
                            value: <Link to={publicBotUrl}>{publicBotUrl}</Link>
                        }
                    ]
                },
                {
                    name:     'Tropo',
                    sections: [
                        {
                            label:     'Tropo Application Token',
                            attribute: 'tropoApplicationToken'
                        },
                        {
                            label: 'Webhook',
                            value: webHookBaseUrl + 'tropo'
                        }
                    ]
                },
                {
                    name:     'Email',
                    sections: [
                        {
                            label:       'Email Domain Name',
                            attribute:   'emailDomainName',
                            placeholder: ownDomain
                        },
                        {
                            label: 'Bot Email Address',
                            value: <a href={'mailto:' + botEmail}>{botEmail}</a>
                        }
                    ]
                },
            ];


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

                    <FormGroup
                        controlId="settings_dashbotId">
                        <Col componentClass={ControlLabel} sm={2}>
                            Dashbot ID
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="text"
                                value={bot.settings.dashbotId || ''}
                                placeholder="Dashbot ID"
                                onChange={this.onFormFieldChange}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup
                        controlId="settings_dashbotGenericKey">
                        <Col componentClass={ControlLabel} sm={2}>
                            Dashbot Generic Key
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="text"
                                value={bot.settings.dashbotGenericKey || ''}
                                placeholder="Dashbot Generic Key"
                                onChange={this.onFormFieldChange}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup
                        controlId="settings_witAccessToken">
                        <Col componentClass={ControlLabel} sm={2}>
                            Wit Access Token
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type="text"
                                value={bot.settings.witAccessToken || ''}
                                placeholder="Wit Access Token"
                                onChange={this.onFormFieldChange}
                            />
                        </Col>
                    </FormGroup>

                    <div>
                        <h2>Channel specific settings</h2>
                        <Tabs defaultActiveKey={1}>
                            {tabs.map((tab, tabIndex) => {
                                let sections = [];

                                tab.sections.forEach((section, sectionIndex) => {
                                    let value;

                                    if (section.readonly) {
                                        value = (
                                            <div className="form-control-static">
                                                {bot.settings[section.attribute]}
                                            </div>
                                        );
                                    } else if (section.attribute) {
                                        value = <FormControl
                                            type="text"
                                            value={bot.settings[section.attribute] || ''}
                                            placeholder={section.placeholder || section.label}
                                            onChange={this.onFormFieldChange}
                                        />
                                    } else {
                                        value = <div className="form-control-static">{section.value}</div>;
                                    }

                                    sections.push(
                                        <FormGroup
                                            controlId={'settings_' + (section.attribute || `${tabIndex}_${sectionIndex}`)}>
                                            <Col componentClass={ControlLabel} sm={3}>
                                                {section.label}
                                            </Col>
                                            <Col sm={9}>
                                                {value}
                                            </Col>
                                        </FormGroup>
                                    );
                                });

                                return <Tab eventKey={tabIndex + 1} title={tab.name}>{sections}</Tab>;
                            })}
                        </Tabs>
                    </div>
                </Form>
            );
        } else {
            if (this.state.errorCode) {
                content = <Alert bsStyle="danger">{errors[this.state.errorCode]}</Alert>;
            } else {
                content = <div className="spinner"><i className="icon-spinner animate-spin"/></div>;
            }
        }

        if (this.state.saved) {
            alert = <Alert bsStyle="success">Settings saved</Alert>;
        }

        if (bot && this.state.errorCode) {
            alert = <Alert bsStyle="danger">{errors[this.state.errorCode]}</Alert>;
        }

        return (
            <div className={`bot-settings-page-comp ${className}`}>
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
                                    { this.state.busy && <i className="icon-spinner animate-spin"></i> }
                                    { ' ' }
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
