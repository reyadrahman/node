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
            categories: '',
        };
    },

    send(e) {
        e.preventDefault();
        const { message, selectedBotId, categories } = this.state;
        if (message && selectedBotId) {
            const cats = categories.split(',').map(x => x.trim()).filter(x => x);
            console.log('NotificationsPage: send: selectedBotId: ', selectedBotId,
                        ', message: ', message, ', categories: ', cats);
            this.props.sendNotification(selectedBotId, message, cats);
        }
    },

    onBotChange(e) {
        this.setState({ selectedBotId: e.target.value });
    },

    onMessageChange(e) {
        this.setState({ message: e.target.value });
    },

    onCategoriesChange(e) {
        this.setState({ categories: e.target.value });
    },

    componentDidMount() {
        const { currentUser: cu, fetchBots } = this.props;
        if (cu) {
            fetchBots();
        }
    },

    render() {
        const { className, currentUser, i18n: { strings: { notificationsPage: strings } },
        } = this.props;
        if (!currentUser || !currentUser.attributes) {
            return null;
        }

        const { message, selectedBotId } = this.state;

        const botsState = currentUser && currentUser.botsState;

        const fetchingBots = botsState && botsState.isFetchingBotsState &&
            <h2 className="fetching-bots">{strings.fetching}</h2>;

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
            <h2 className="empty-bot-list">You don't have any bots yet</h2>;

        return (
            <div className={`notifications-page-comp ${className || ''}`}>
                <h1 className="title">{strings.notifications}</h1>
                {
                    botsAreReady ? null : (fetchingBots || emptyBotList)
                }
                {
                    botsAreReady &&
                    <form className="send-notifications-form">
                        { botSelect }
                        <FormGroup
                            controlId="categories"
                        >
                            <ControlLabel>Categories (optional)</ControlLabel>
                            <FormControl
                                type="text"
                                value={this.state.categories}
                                placeholder="List of comma separated categories"
                                onChange={this.onCategoriesChange}
                            />
                        </FormGroup>
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
                        <div className="button-area">
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
