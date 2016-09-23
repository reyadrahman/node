/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';

let InputBox = React.createClass({
  getInitialState: function() {
    return {text: ''};
  },
  _entry: function(e) {
    console.log('_entry called');
    console.log('e.nativeEvent.keyCode = ' + e.nativeEvent.keyCode);
    if (e.nativeEvent.keyCode == 13) {
      let text = e.target.value;
      this.props.onMessageSubmit(text);
    }
  },
  render: function() {
    console.log('InputBox rendered');
    return (
      <div class="inputBox">
        <input onKeyPress={ this._entry }
          placeholder="Say hello to our bot !"/>
      </div>
    );
  }
});

export default InputBox;
