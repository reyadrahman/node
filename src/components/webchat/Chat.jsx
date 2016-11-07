/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import _ from 'lodash';
import uuid from 'node-uuid';
import MessagesFeed from './MessagesFeed.jsx';
import Messages from './Messages.jsx';
import InputBox from './InputBox.jsx';

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

        let message         = JSON.parse(data);
        message.senderIsBot = true;
        message.senderName  = this.props.bot.botName;

        this.setState({data: this.state.data.concat([message])})
    },

    handleMessageSubmit: function (text) {
        let bot = this.props.bot;

        let messages = this.state.data;
        let message  = {
            receivedOrSent:    'sent',
                               text,
            publisherId:       bot.publisherId,
            botId:             bot.botId,
            senderName:        'You',
            conversationId:    this.state.conversationId,
            senderId:          this.state.senderId,
            creationTimestamp: Date.now()
        };
        // message.id = uuid.v1();
        //Send message to websocket

        reportDebug('sending message', message);

        this.ws.send(JSON.stringify(message));

        let newMessages = messages.concat([message]);
        this.setState({data: newMessages});
    },
    componentWillMount:  function () {
        this.setState({
            conversationId: uuid.v1(),
            senderId:       uuid.v1()
        });

        //Initialize connection to websocket and stock ws in component instance

        try {
            this.setupWebsocket();
        } catch (e) {
            reportError(e);
        }
    },

    setupWebsocket: function () {
        let websocket = this.ws = new WebSocket('ws://localhost:3000');

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
        let bot = this.props.bot;

        return (
            <section className="chatBotContainer">
                <div className="chatBotHeader">
                    {`Hi! I'm ${bot.botName}. Say "hi" if you'd like to chat`}
                </div>
                <div className="chatBot">
                    <Messages messages={ this.state.data }/>
                    <InputBox onMessageSubmit={ this.handleMessageSubmit }/>
                </div>
            </section>
        );
    }
});

export default Chat;
