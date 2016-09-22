/* @flow */

import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import Conversations from './Conversations.jsx';
import Messages from './Messages.jsx';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

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
        const { currentUser: cu, params, fetchConversations, fetchMessages } = this.props;
        if (!cu || !cu.attributes || !cu.attributes.sub) {
            return;
        }
        if (!cu.conversationsState || !cu.conversationsState.conversations) {
            fetchConversations();
        }
        if (params.conversationId) {
            fetchMessages(params.conversationId);
        }
    },

    componentDidUpdate(oldProps) {
        const { params, currentUser: cu, fetchConversations, fetchMessages } = this.props;
        if (!cu || !cu.attributes || !cu.attributes.sub) {
            return;
        }
        if (params.conversationId && params.conversationId !== oldProps.params.conversationId) {
            fetchMessages(params.conversationId);
        }
        // if (params.conversationId &&
        //     (!cu.messagesCacheState || !cu.messagesCacheState.isFetchingMessagesCacheState) &&
        //     params.conversationId !== oldProps.params.conversationId)
        // {
        //     fetchMessages(newProps.params.conversationId);
        // }
        //
        if (cu.attributes.sub !== (oldProps.currentUser &&
                                   oldProps.currentUser.attributes &&
                                   oldProps.currentUser.attributes.sub))
        {
            fetchConversations();
            console.log('**** params.conversationId', params.conversationId);
            if (params.conversationId) {
                fetchMessages(params.conversationId);
            }
        }
    },

    render() {
        const { className, params, currentUser, i18n,
                i18n: { strings: { messagesPage: strings } },
                /*successMessage, errorMessage*/ } = this.props;
        // const { state } = this;

        if (!currentUser) {
            return (
                <div className={`messages-page-comp ${className || ''}`}>
                    <div className="please-sign-in">
                        PLEAASE SIGN IN
                    </div>
                </div>
            );
        }

        const { conversationsState: cs } = currentUser;
        const noConversationsFound = cs && cs.conversations && cs.conversations.length === 0;
        const isFetchingConversationsState = !cs || cs.isFetchingConversationsState;

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
                        noConversationsFound={noConversationsFound}
                        isFetchingConversationsState={isFetchingConversationsState}
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
