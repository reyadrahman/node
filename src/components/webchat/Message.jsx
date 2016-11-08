/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import _ from 'lodash';

let Message = React.createClass({
    render: function () {
        const {message} = this.props;

        let direction, senderName, className;

        if (message.senderIsBot) {
            className  = 'received';
            direction  = '<';
            senderName = message.senderName;
        } else {
            className  = 'sent';
            direction  = '>';
            senderName = 'You';
        }

        return (
            <div className="messageContainer">
                <p className={className}>
                    {direction} <b>{senderName}</b>: { message.text }
                </p>
            </div>
        );
    }
});

export default Message;
