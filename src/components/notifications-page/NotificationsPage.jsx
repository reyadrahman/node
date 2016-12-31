import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import _ from 'lodash';
import {Button, FormGroup, ControlLabel, FormControl} from 'react-bootstrap';

let NotificationsPage = React.createClass({
    getInitialState() {
        return {
            message:    '',
            categories: ''
        };
    },

    send(e) {
        e.preventDefault();
        const {message, categories} = this.state;
        let selectedBotId           = this.props.currentUser.selectedBotId;
        if (message && selectedBotId) {
            const cats = categories.split(',').map(x => x.trim()).filter(x => x);
            const msg = {text: message};
            this.props.sendNotification(selectedBotId, msg, cats);
        }
    },

    onMessageChange(e) {
        this.setState({message: e.target.value});
    },

    onCategoriesChange(e) {
        this.setState({categories: e.target.value});
    },

    componentDidMount() {
        // const { currentUser, fetchBots } = this.props;
        // if (currentUser) {
        //     fetchBots();
        // }
    },

    render() {
        const {
                  className, currentUser: {signedIn, botsState, selectedBotId},
                  i18n: {strings: {notificationsPage: strings}},
              } = this.props;

        if (!signedIn) {
            return null;
        }

        const {message} = this.state;

        const fetchingBots = !botsState.hasFetched &&
            <h2 className="fetching-bots">{strings.fetching}</h2>;

        const botsAreReady = !_.isEmpty(botsState.bots);
        let botInfo;
        if (botsAreReady) {
            let selectedBot = _.find(botsState.bots, {botId: selectedBotId});

            botInfo = <h2>{selectedBot.botName}</h2>;
        }

        const emptyBotList = botsState.hasFetched && _.isEmpty(botsState.bots) &&
            <h2 className="empty-bot-list">{"You don't have any bots yet"}</h2>;

        return (
            <div className={`notifications-page-comp ${className || ''}`}>
                <h1 className="title">{strings.notifications}</h1>
                { botInfo }
                {
                    botsAreReady ? null : (fetchingBots || emptyBotList)
                }
                {
                    botsAreReady &&
                    <form className="send-notifications-form">
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
        fetchBots:        actions.fetchBots,
        sendNotification: actions.sendNotification,
    }
)(NotificationsPage);

NotificationsPage = withRouter(NotificationsPage);


export default NotificationsPage;
