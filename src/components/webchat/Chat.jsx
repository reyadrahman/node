/* @flow */

import React from 'react';
import uuid from 'node-uuid';
import Messages from './Messages.jsx';
import InputBox from './InputBox.jsx';
import {CONSTANTS} from '../../client/client-utils';

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

    handleAttachment: function (attachmentDataUrl) {
        let bot = this.props.bot;

        let messages = this.state.data;
        let message  = {
            receivedOrSent:    'sent',
            publisherId:       bot.publisherId,
            botId:             bot.botId,
            senderName:        'You',
            conversationId:    this.state.conversationId,
            senderId:          this.state.senderId,
            creationTimestamp: Date.now(),
            cards:             [{
                imageUrl: attachmentDataUrl
            }]
        };
        // message.id = uuid.v1();
        //Send message to websocket

        reportDebug('handling uploaded image', message);
        //
        this.ws.send(JSON.stringify(message));

        let newMessages = messages.concat([message]);
        this.setState({data: newMessages});
    },

    handleAction: function (action) {
        console.log(action);
        if (action.url) {
            window.open(action.url);
        } else { // postback
            this.handleMessageSubmit(action.postback);
        }
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
        let address = CONSTANTS.RUNNING_LOCALLY
            ? `ws://localhost:${CONSTANTS.PORT}`
            : CONSTANTS.OWN_BASE_URL.replace(/^https/i, 'wss').replace(/^http/i, 'ws');
        let websocket = this.ws = new WebSocket(address);

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
            <section className="chatBotContainer nation">
                <div className="chatBotHeader">
                    {`Hi! I'm ${bot.botName}. Say "hi" if you'd like to chat`}
                </div>
                <div className="chatBot">
                    <Messages messages={ this.state.data } handleAction={this.handleAction}/>
                    <InputBox
                        onAttachmentSubmit={ this.handleAttachment }
                        onMessageSubmit={ this.handleMessageSubmit }/>
                </div>
            </section>
        );
    }
});

export default Chat;
