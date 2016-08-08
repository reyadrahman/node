import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
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
                params, currentUser, i18n: { strings: { conversations: strings } },
                /*successMessage, errorMessage*/ } = this.props;
        // const { state } = this;

        console.log('ConversationsPage: currentUser: ', currentUser);

        if (!currentUser) {
            return (
                <h3>Please log in</h3>
            );
        }

        if (!currentUser.conversationsState ||
            !currentUser.conversationsState.conversations ||
            currentUser.conversationsState.isFetchingConversationsState)
        {
            return (
                <h3>Please wait...</h3>
            );
        }

        const convs = currentUser.conversationsState.conversations;

        if (convs.length === 0) {
            return (
                <h3>No conversations found</h3>
            );
        }

        const contacts = convs.map((x, i) => {
            return (
                <div
                    className={ss.contact}
                    onClick={() => this.props.router.push(`/conversations/${x.conversationId}`)}
                >
                    {`Conversation ${i + 1}`}
                </div>
            );
        });

        const noConvSelected = !params.conversationId &&
            <h3>Please select a conversation</h3>;

        const messagesCacheState = currentUser.messagesCacheState;

        const messagesCache = messagesCacheState &&
            messagesCacheState.messagesCache

        const fetchingMessages = params.conversationId &&
            (!messagesCache || !messagesCache[params.conversationId]) &&
            <h3>Please wait</h3>

        const messages = messagesCache &&
            params.conversationId &&
            messagesCache[params.conversationId] &&
            messagesCache[params.conversationId].map(
                x => <Message styles={styles} message={x} />
            );


        return (
            <div className={`${ss.root} ${className || ''}`}>
                <div className={ss.leftRightSplit}>
                    <div className={ss.contacts}>
                        { contacts }
                    </div>
                    <div className={ss.messages}>
                        { noConvSelected || fetchingMessages || messages }
                    </div>
                </div>
            </div>
        );

        // const botsState = currentUser && currentUser.botsState;
        //
        // const fetchingBot = botsState && botsState.isFetchingBotState &&
        //     <div>Fetching bots...</div>;
        // const botList = botsState && botsState.bots && botsState.bots.map(x => {
        //     return (
        //         <div>
        //             <Link to={`/bots/${x.botId}`}>
        //                 {x.botName}
        //             </Link>
        //         </div>
        //     );
        // });
        // const emptyBotList = (botList && botList.length === 0) &&
        //     <div>You have no bots</div>;
        //
        //
        // return (
        //     <div className={`${ss.root} ${className || ''}`}>
        //         {
        //             fetchingBot || emptyBotList || botList
        //         }
        //         <Form styles={styles} onSubmit={this.addBot}>
        //             <Button
        //                 className={ss.addBotButton}
        //                 label={strings.addBot}
        //                 styles={styles}
        //                 type='submit'
        //             />
        //         </Form>
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


export const Message = ({
    className,
    styles: { conversationsPage: ss },
    message,
    ...others
}) => {
    return (
        <div className={`${ss.message} ${className || ''}`} {...others} >
            { message.text }
            {
                message.files && message.files.map(x => (
                    <img className={ss.image} src={x} />
                ))
            }
        </div>
    );
};


export default ConversationPage;
