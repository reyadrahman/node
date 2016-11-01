/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';
import Message from './Message.jsx';

let MessagesFeed = React.createClass({
  render: function() {
    let messages = this.props.data.map(m => {
      return (
        <Message message={ m } receivedOrSent="received"/>
      );
    });
    return (
      <div className="messagesFeed">
        { messages }
      </div>
    );
  }
});

export default MessagesFeed;
