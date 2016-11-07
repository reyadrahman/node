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
    textEntered:     function (e) {
        let text = e.target.value;
        this.setState({text});
    },
    onKeyUp:         function (e) {
        if (e.nativeEvent.keyCode == 13) {
            this.send();
        }
    },

    send: function (e = null) {
        e && e.preventDefault();

        if (this.state.text) {
            this.props.onMessageSubmit(this.state.text);
            this.setState(this.getInitialState());
        }
    },

    uploadImage: function (e) {
        e.preventDefault();
    },



    render:          function () {
        return (
            <div className="inputBox">
                <div className="input-group">
                    <div className="input-group-addon action" onClick={this.uploadImage}>
                        <i className="icon-file-image"/>
                    </div>
                    <input className="form-control"

                           onChange={ this.textEntered }
                           onKeyUp={ this.onKeyUp }
                           value={this.state.text}
                           placeholder="Type your message..."/>

                    <div className="input-group-addon action" onClick={this.send}>
                        <i className="icon-paper-plane-empty"/>
                    </div>
                </div>

            </div>
        );
    }
});

export default InputBox;
