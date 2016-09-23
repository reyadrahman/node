/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';
import uuid from 'node-uuid';
import MessagesFeed from './MessagesFeed.jsx';
import InputBox from './InputBox.jsx';

let Chat = React.createClass({
  handleMessageSubmit: function(text) {
    let messages = this.state.data;
    let message = {};
    // message.id = uuid.v1();
    message.receivedOrSent = 'sent';
    message.text = text;
    //Send message to websocket
    let newMessages = messages.concat([message]);
    this.setState({ data: newMessages });
  },
  getInitialState: function() {
    return { data: [] };
  },
  componentDidMount: function() {
    this.props.conversationId = uuid.v1();
    this.props.senderId = uuid.v1();
    //Initialize connection to websocket and stock ws in props
  },
  render: function() {
    console.log('Chat rendered');
    return (
      <section className="chatBotContainer">
        <div class="chatBot">
            <MessagesFeed data={ this.state.data }/>
            <InputBox onMessageSubmit={ this.handleMessageSubmit }/>
        </div>
      </section>
    );
  }
});

export default Chat;
