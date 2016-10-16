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

let TranscriptsPage = React.createClass({
    heartbeatEnabled: true,

    getInitialState() {
        return {
        };
    },

    // addBot(e) {
    //     e.preventDefault();
    //     this.props.router.push('/add-bot');
    // },

    conversationSelected(conversationId) {
        this.props.router.push(`/transcripts/${this.props.currentUser.selectedBotId}/${conversationId}`)
    },

    componentDidMount() {
        const { currentUser, params, fetchConversations, fetchMessages } = this.props;
        if (!currentUser.signedIn) {
            return;
        }

        if (params.selectedBotId && params.selectedBotId !== currentUser.selectedBotId) {
            this.props.selectBot(params.selectedBotId);
        }

        if (currentUser.selectedBotId) {
            fetchConversations(currentUser.selectedBotId);
        }

        if (params.conversationId) {
            fetchMessages(params.conversationId);
        }

        this.heartbeat();
    },

    async heartbeat(){
        setTimeout(async() => {
            if (!this.heartbeatEnabled) { return; }
            if (this.props.currentUser.selectedBotId && this.props.currentUser.conversationsState.hasFetched) {
                try {
                    await this.props.updateConversations(
                        this.props.currentUser.selectedBotId,
                        this.props.currentUser.conversationsState.lastUpdated - 60000
                    );
                } catch (e) { }

                if (this.props.params.conversationId) {
                    try {
                        await this.props.updateMessages(
                            this.props.params.conversationId,
                            this.props.currentUser.messagesState.lastUpdated - 60000
                        );
                    } catch (e) { }
                }
            }

            this.heartbeat();
        }, 10000);
    },

    componentDidUpdate(oldProps) {
        const { params, currentUser, fetchConversations, fetchMessages } = this.props;
        if (!currentUser.signedIn) {
            return;
        }

        if (currentUser.selectedBotId && params.selectedBotId != currentUser.selectedBotId) {
            this.props.router.push(`/transcripts/${currentUser.selectedBotId}`);
        }

        if (currentUser.selectedBotId != oldProps.currentUser.selectedBotId) {
            fetchConversations(currentUser.selectedBotId);
        }

        if (params.conversationId && params.conversationId !== oldProps.params.conversationId) {
            fetchMessages(params.conversationId);
        }

        if (currentUser.attributes.sub !== oldProps.currentUser.attributes.sub) {
            fetchConversations(currentUser.selectedBotId);
            console.log('TranscriptsPage componentDidUpdate params.conversationId', params.conversationId);
            if (params.conversationId) {
                fetchMessages(params.conversationId);
            }
        }
    },

    componentWillUnmount() {
        this.heartbeatEnabled = false;
    },

    render() {
        const { className, params, currentUser, i18n,
                i18n: { strings: { TranscriptsPage: strings } } } = this.props;

        if (!currentUser.signedIn) {
            return null;
        }

        return (
            <div className={`messages-page-comp ${className || ''}`}>
                <div className="left-right-split">
                    <Conversations
                        currentUser={currentUser}
                        selectedConversationId={params.conversationId}
                        i18n={i18n}
                        onSelectConversation={this.conversationSelected}
                    />
                    <Messages
                        currentUser={currentUser}
                        selectedConversationId={params.conversationId}
                        i18n={i18n}
                    />
                </div>
            </div>
        );
    }
});

TranscriptsPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        selectBot:           actions.selectBot,
        fetchConversations:  actions.fetchConversations,
        updateConversations: actions.updateConversations,
        fetchMessages:       actions.fetchMessages,
        updateMessages:      actions.updateMessages,
    }
)(TranscriptsPage);

TranscriptsPage = withRouter(TranscriptsPage);


export default TranscriptsPage;
