/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import _ from 'lodash';
import uuid from 'node-uuid';
import MessagesFeed from './MessagesFeed.jsx';
import InputBox from './InputBox.jsx';

import moment from 'moment';


const reportDebug = require('debug')('deepiks:WebChat');
const reportError = require('debug')('deepiks:WebChat:error');

let Chat = React.createClass({
    shouldReconnect: true,
    ws:              null,

    getInitialState: function () {
        return {
            data:     [],
            attempts: 1,
        }
    },

    handleMessageReceived: function (data) {
        reportDebug('webchat message received:', data);

        let message = JSON.parse(data);
        message.senderIsBot = true;
        message.senderName = 'Deepiks Pitching';

        this.setState({data: this.state.data.concat([message])})
    },

    handleMessageSubmit: function (text) {
        let messages = this.state.data;
        let message  = {
            receivedOrSent: 'sent',
                            text,
            publisherId:    'eu-west-1:9b648ba2-d018-4723-8b65-2710b3062119',
            botId:          '8c334a80-8aee-11e6-bc96-c186c2efac62',
            conversationId: this.props.conversationId,
            senderId:       this.props.senderId,
            timestamp:      moment().format('x')
        };
        // message.id = uuid.v1();
        //Send message to websocket

        reportDebug('sending message', message);

        this.ws.send(JSON.stringify(message));

        let newMessages = messages.concat([message]);
        this.setState({data: newMessages});
    },
    componentWillMount:  function () {
        this.props.conversationId = uuid.v1();
        this.props.senderId       = uuid.v1();
        //Initialize connection to websocket and stock ws in props

        try {
            this.setupWebsocket();
        } catch (e) {
            reportError(e);
        }
    },

    setupWebsocket: function () {
        let websocket = this.ws = new WebSocket('ws://localhost:3000');

        reportDebug('websocket', websocket);

        websocket.onopen = () => {
            reportDebug('Websocket connected');
        };

        websocket.onmessage = (evt) => {
            this.handleMessageReceived(evt.data);
        };

        websocket.onclose = () => {
            reportDebug('Websocket disconnected');

            if (this.shouldReconnect) {
                let time = this.generateInterval(this.state.attempts);
                setTimeout(() => {
                    this.setState({attempts: this.state.attempts++});
                    this.setupWebsocket();
                }, time);
            }
        };

        websocket.onerror = error => {
            reportError('websocket error: ', error);
        };
    },

    componentWillUnmount() {
        this.shouldReconnect = false;
        this.ws.close();
    },

    generateInterval: function (k) {
        return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
    },

    render: function () {
        return (
            <section className="chatBotContainer">
                <div className="chatBot">
                    <MessagesFeed data={ this.state.data }/>
                    <InputBox onMessageSubmit={ this.handleMessageSubmit }/>
                </div>
            </section>
        );
    }
});

export default Chat;
