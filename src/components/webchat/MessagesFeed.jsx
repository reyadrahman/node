/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';
import Message from './Message.jsx';

let MessagesFeed = React.createClass({
  render: function() {
    return (
      <div className="messagesFeed">
          { this.props.messages.map(m => {
              return (
                  <Message message={ m }/>
              );
          }) }
      </div>
    );
  }
});

export default MessagesFeed;
