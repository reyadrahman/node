/* @flow */

import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import Conversations from './Conversations.jsx';
import Messages from './Messages.jsx';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

let ConversationPage = React.createClass({
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
        const { className, styles, styles: { conversationsPage: ss },
                params, currentUser, i18n,
                i18n: { strings: { conversations: strings } },
                /*successMessage, errorMessage*/ } = this.props;
        // const { state } = this;

        if (!currentUser) {
            return <div className={`${ss.root} ${className || ''}`}></div>
            // return (
            //     <div className={ss.pleaseLogin}>
            //         Please log in
            //     </div>
            // );
        }

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <div className={ss.leftRightSplit}>
                    <Conversations
                        className={ss.conversations}
                        currentUser={currentUser}
                        selectedConversationId={params.conversationId}
                        styles={styles}
                        i18n={i18n}
                        onSelectConversation={this.conversationSelected}
                    />
                    <Messages
                        className={ss.messages}
                        currentUser={currentUser}
                        selectedConversationId={params.conversationId}
                        styles={styles}
                        i18n={i18n}
                    />
                </div>
            </div>
        );
        //
        //
        //
        //
        //
        //
        // console.log('ConversationsPage: currentUser: ', currentUser);
        //
        // if (!currentUser) {
        //     return (
        //         <h3>Please log in</h3>
        //     );
        // }
        //
        // if (!currentUser.conversationsState ||
        //     !currentUser.conversationsState.conversations ||
        //     currentUser.conversationsState.isFetchingConversationsState)
        // {
        //     return (
        //         <h3>Please wait...</h3>
        //     );
        // }
        //
        // const convs = currentUser.conversationsState.conversations;
        //
        // if (convs.length === 0) {
        //     return (
        //         <h3>No conversations found</h3>
        //     );
        // }
        //
        // const contacts = convs.map((x, i) => {
        //     return (
        //         <div
        //             className={ss.contact}
        //             onClick={() => this.props.router.push(`/conversations/${x.conversationId}`)}
        //         >
        //             {`Conversation ${i + 1}`}
        //         </div>
        //     );
        // });
        //
        // const noConvSelected = !params.conversationId &&
        //     <h3>Please select a conversation</h3>;
        //
        // const messagesCacheState = currentUser.messagesCacheState;
        //
        // const messagesCache = messagesCacheState &&
        //     messagesCacheState.messagesCache
        //
        // const fetchingMessages = params.conversationId &&
        //     (!messagesCache || !messagesCache[params.conversationId]) &&
        //     <h3>Please wait</h3>
        //
        // const messages = messagesCache &&
        //     params.conversationId &&
        //     messagesCache[params.conversationId] &&
        //     messagesCache[params.conversationId].map(
        //         x => <Message styles={styles} message={x} />
        //     );
        //
        //
        // return (
        //     <div className={`${ss.root} ${className || ''}`}>
        //         <div className={ss.leftRightSplit}>
        //             <div className={ss.contacts}>
        //                 { contacts }
        //             </div>
        //             <div className={ss.messages}>
        //                 { noConvSelected || fetchingMessages || messages }
        //             </div>
        //         </div>
        //     </div>
        // );
    }
});

ConversationPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        fetchConversations: actions.fetchConversations,
        fetchMessages: actions.fetchMessages,
    }
)(ConversationPage);

ConversationPage = withRouter(ConversationPage);


export default ConversationPage;
