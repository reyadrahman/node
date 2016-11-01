/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import _ from 'lodash';

let InputBox = React.createClass({
    getInitialState: function () {
        return {text: ''};
    },
    _entry:          function (e) {
        let text = e.target.value;
        console.log(text);
        this.setState({text});
    },
    onKeyUp:         function (e) {
        if (e.nativeEvent.keyCode == 13) {
            this.props.onMessageSubmit(this.state.text);
            this.setState(this.getInitialState());
        }
    },
    render:          function () {
        return (
            <div className="inputBox">
                <input className="form-control"

                       onChange={ this._entry }
                       onKeyUp={ this.onKeyUp }
                       value={this.state.text}
                       placeholder="Say hello to our bot !"/>
            </div>
        );
    }
});

export default InputBox;
