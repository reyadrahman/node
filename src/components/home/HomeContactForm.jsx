import * as actions from '../../actions/actions.js';

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { Glyphicon, Grid, Col, Row, Panel, Button,
         FormGroup, ControlLabel, FormControl,
         InputGroup, Dropdown } from 'react-bootstrap';

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
        const { name, email, subject, message } = this.state;
        this.props.sendEmail({ name, email, subject, message });
    },

    render() {
        console.log('Home render');
        const { className, styles, styles: { homeContactForm: ss },
                i18n, i18n: { strings: { homeContactForm: strings } },
                successMessage, errorMessage,
        } = this.props;

        const { state } = this;

        let statusUi;
        if (errorMessage) {
            statusUi = <div className={ss.errorMessage}>{ errorMessage }</div>
        } else if (successMessage) {
            statusUi = <div className={ss.successMessage}>{ successMessage }</div>
        }

        return (
            <form className={ss.root}>
                <Grid>
                    <Col md={8} mdOffset={2} className={ss.greyBox}>
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
                            <Col md={8} className={ss.statusMessage}>
                                { statusUi }
                            </Col>
                            <Col md={4} className={ss.sendCol}>
                                <Button onClick={this.send}>
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
        errorMessage: state.contacts.errorMessage,
        successMessage: state.contacts.successMessage,
    }),
    {
        sendEmail: actions.sendEmail,
    }
)(HomeContactForm);

export default HomeContactForm;
