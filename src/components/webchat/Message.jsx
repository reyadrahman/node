/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';

let Message = React.createClass({
  render: function() {
    // receivedOrSent: text with received or sent
    const { text,/* cards, actions,*/ receivedOrSent/*, time*/ } = this.props;
    console.log('Message rendered');
    return (
      <div className="messageContainer">
        <p className="{ receivedOrSent }">
          { text }
        </p>
      </div>
    );
  }
});

export default Message;
