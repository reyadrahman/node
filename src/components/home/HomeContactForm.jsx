import * as actions from '../../app-state/actions.js';
import * as E from '../../misc/error-codes.js';
import { isValidEmail } from '../../misc/utils.js';

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { Glyphicon, Grid, Col, Row, Panel, Button,
         FormGroup, ControlLabel, FormControl,
         InputGroup, Dropdown } from 'react-bootstrap';
const reportDebug = require('debug')('deepiks:HomeContactForm');

let HomeContactForm = React.createClass({
    getInitialState() {
        return {
            name: '',
            email: '',
            subject: '',
            message: '',
        };
    },

    onInputChange(e, key) {
        this.setState({ [key]: e.target.value });
    },

    send() {
        const name = this.state.name.trim();
        const email = this.state.email.trim();
        const subject = this.state.subject.trim();
        const message = this.state.message.trim();

        if (!isValidEmail(email)) {
            reportDebug('send email: ', email);
            return this.props.contactsFailed(E.SEND_EMAIL_INVALId_EMAIL);
        }

        this.props.sendEmail({ name, email, subject, message });
    },

    render() {
        const { className, i18n,
                i18n: { strings: { errors, successes, homeContactForm: strings } },
                successCode, errorCode, sendingInProgress
        } = this.props;

        const { state } = this;

        let statusUi;
        if (errorCode) {
            statusUi = <div className="error-message">
                {
                    errors[errorCode] || errors[E.SEND_EMAIL_GENERAL]
                }
                </div>
        } else if (successCode) {
            statusUi = <div className="success-message">{ successes[successCode] }</div>
        }

        return (
            <form className="home-contact-form-comp">
                <Grid>
                    <Col md={8} mdOffset={2} className="grey-box">
                        <Row>
                            <Col md={6}>
                                <FormGroup controlId="formControlName">
                                    <ControlLabel>{ strings.name }</ControlLabel>
                                    <FormControl
                                        type="text"
                                        placeholder={ strings.namePlaceholde }
                                        value={ state.name }
                                        onChange={ e => this.onInputChange(e, 'name') }
                                    />
                                </FormGroup>
                                <FormGroup controlId="formControlEmail">
                                    <ControlLabel>{ strings.email }</ControlLabel>
                                    <InputGroup>
                                        <InputGroup.Addon>
                                            <Glyphicon glyph="envelope" />
                                        </InputGroup.Addon>
                                        <FormControl
                                            type="email"
                                            placeholder={ strings.emailPlaceholder }
                                            value={ state.email }
                                            onChange={ e => this.onInputChange(e, 'email') }
                                        />
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup controlId="formControlsSelectMultiple">
                                    <ControlLabel>{ strings.subject }</ControlLabel>
                                    <FormControl
                                        componentClass="select"
                                        value={ state.subject }
                                        onChange={ e => this.onInputChange(e, 'subject') }
                                    >
                                        <option value="">
                                            { strings.selectSubject }
                                        </option>
                                        <option value="general customer service">
                                            { strings.generalCustomerService }
                                        </option>
                                        <option value="suggestions">
                                            { strings.suggestions }
                                        </option>
                                        <option value="other">
                                            { strings.other }
                                        </option>
                                    </FormControl>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup controlId="formControlTextarea">
                                    <ControlLabel>{ strings.message }</ControlLabel>
                                    <FormControl
                                        componentClass="textarea"
                                        placeholder={ strings.messagePlaceholder }
                                        value={ state.message }
                                        onChange={ e => this.onInputChange(e, 'message') }
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={8} className="status-message">
                                { statusUi }
                            </Col>
                            <Col md={4} className="send-col">
                                <Button onClick={this.send} disabled={sendingInProgress}>
                                    { sendingInProgress && <i className="icon-spinner animate-spin"></i> }
                                    { ' ' }
                                    { strings.send }
                                </Button>
                            </Col>

                        </Row>
                    </Col>
                </Grid>
            </form>
        );
    },
});

HomeContactForm = connect(
    state => ({
        errorCode: state.contacts.errorCode,
        successCode: state.contacts.successCode,
        sendingInProgress: state.contacts.sendingInProgress,
    }),
    {
        sendEmail: actions.sendEmail,
        contactsFailed: actions.contactsFailed,
    }
)(HomeContactForm);

export default HomeContactForm;
