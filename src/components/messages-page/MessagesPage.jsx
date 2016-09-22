/* @flow */

import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../app-state/actions.js';
import Conversations from './Conversations.jsx';
import Messages from './Messages.jsx';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';

let MessagesPage = React.createClass({
    getInitialState() {
        return {
        };
    },

    // addBot(e) {
    //     e.preventDefault();
    //     this.props.router.push('/add-bot');
    // },

    conversationSelected(conversationId) {
        this.props.router.push(`/messages/${conversationId}`)
    },

    componentDidMount() {
        const { currentUser, params, fetchConversations, fetchMessages } = this.props;
        if (!currentUser.signedIn) {
            return;
        }
        if (!currentUser.conversationsState.hasFetched) {
            fetchConversations(currentUser.selectedBotId);
        }
        if (params.conversationId) {
            fetchMessages(params.conversationId);
        }
    },

    componentDidUpdate(oldProps) {
        const { params, currentUser, fetchConversations, fetchMessages } = this.props;
        if (!currentUser.signedIn) {
            return;
        }
        if (params.conversationId && params.conversationId !== oldProps.params.conversationId) {
            fetchMessages(params.conversationId);
        }
        if (currentUser.attributes.sub !== oldProps.currentUser.attributes.sub) {
            fetchConversations();
            console.log('MessagesPage componentDidUpdate params.conversationId', params.conversationId);
            if (params.conversationId) {
                fetchMessages(params.conversationId);
            }
        }
    },

    render() {
        const { className, params, currentUser, i18n,
                i18n: { strings: { messagesPage: strings } } } = this.props;

        if (!currentUser.signedIn) {
            return null;
        }

        return (
            <div className={`messages-page-comp ${className || ''}`}>
                <div className="left-right-split">
                    <Conversations
                        className="conversations"
                        currentUser={currentUser}
                        selectedConversationId={params.conversationId}
                        i18n={i18n}
                        onSelectConversation={this.conversationSelected}
                    />
                    <Messages
                        className="messages"
                        currentUser={currentUser}
                        selectedConversationId={params.conversationId}
                        i18n={i18n}
                    />
                </div>
            </div>
        );
    }
});

MessagesPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        fetchConversations: actions.fetchConversations,
        fetchMessages: actions.fetchMessages,
    }
)(MessagesPage);

MessagesPage = withRouter(MessagesPage);


export default MessagesPage;
