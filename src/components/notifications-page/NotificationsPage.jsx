import React from 'react';
// import { Form, Input, Button, ButtonArea, TextArea, SuccessMessage,
//          ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
// import { Title } from '../modal-box-1/ModalBox1.jsx';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';
import { Grid, Col, Row, Button, Image, Clearfix,
         FormGroup, ControlLabel, FormControl,
         InputGroup, Dropdown } from 'react-bootstrap';

let NotificationsPage = React.createClass({
    getInitialState() {
        return {
            message: '',
            selectedBotId: '',
        };
    },

    send(e) {
        e.preventDefault();
        if (this.state.message && this.state.selectedBotId) {
            this.props.sendNotification(this.state.selectedBotId, this.state.message);
        }
    },

    onBotChange(e) {
        this.setState({ selectedBotId: e.target.value });
    },

    onMessageChange(e) {
        this.setState({ message: e.target.value });
    },

    componentDidMount() {
        const { currentUser: cu, fetchBots } = this.props;
        if (cu) {
            fetchBots();
        }
    },

    render() {
        const { className, styles, styles: { notificationsPage: ss },
                currentUser, i18n: { strings: { notificationsPage: strings } },
        } = this.props;
        if (!currentUser || !currentUser.attributes) {
            return null;
        }

        const { message, selectedBotId } = this.state;

        const botsState = currentUser && currentUser.botsState;

        const fetchingBots = botsState && botsState.isFetchingBotsState &&
            <h2 className={ss.fetchingBots}>{strings.fetching}</h2>;

        const botsAreReady = botsState && botsState.bots && botsState.bots.length > 0;
        let botSelect;
        if (botsAreReady) {
            const { bots } = botsState;
            botSelect = (
                <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Select Bot</ControlLabel>
                    <FormControl
                        componentClass="select"
                        value={selectedBotId}
                        onChange={this.onBotChange}
                    >
                    <option value="" disabled selected>select</option>
                        {
                            bots.map(b => {
                                return <option value={b.botId}>{b.botName}</option>
                            })
                        }
                    </FormControl>
                </FormGroup>
            );

        }

        const emptyBotList = (botsState && botsState.bots && botsState.bots.length === 0) &&
            <h2 className={ss.emptyBotList}>You don't have any bots yet</h2>;

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <h1 className={ss.title}>{strings.notifications}</h1>
                {
                    botsAreReady ? null : (fetchingBots || emptyBotList)
                }
                {
                    botsAreReady &&
                    <form className={ss.form}>
                        { botSelect }
                        <FormGroup
                            controlId="form"
                        >
                            <FormControl
                                componentClass="textarea"
                                value={message}
                                placeholder="Enter message"
                                onChange={this.onMessageChange}
                                />
                        </FormGroup>
                        <div className={ss.buttonArea}>
                            <Button
                                onClick={this.send}
                                bsStyle="primary"
                                disabled={!message || !selectedBotId}
                            >
                                SEND
                            </Button>
                        </div>

                    </form>

                }
            </div>
        );
    }
});

NotificationsPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        fetchBots: actions.fetchBots,
        sendNotification: actions.sendNotification,
    }
)(NotificationsPage);

NotificationsPage = withRouter(NotificationsPage);


export default NotificationsPage;
