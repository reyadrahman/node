/* @flow */

import { simpleTimeFormat } from '../../misc/utils.js';

import React from 'react';
import _ from 'lodash';
import { Alert } from 'react-bootstrap';

// $FlowFixMe
import defaultAvatarUrl from '../../resources/avatar.jpg';

let Messages = React.createClass({
    render() {
        const { className, selectedConversationId,
                currentUser: { conversationsState, messagesState },
                i18n: { strings: { errors, messages: strings } }
              } = this.props;

        if (conversationsState.errorCode || messagesState.errorCode) {
            const errorMessage = errors[conversationsState.errorCode || messagesState.errorCode];
            return (
                <div className={`messages-comp ${className || ''}`}>
                    <Alert bsStyle="danger">{errorMessage}</Alert>
                </div>
            );
        }

        const noConversationsFound =
            conversationsState.hasFetched && _.isEmpty(conversationsState.conversations);

        if (noConversationsFound) {
            return (
                <div className={`messages-comp ${className || ''}`}>
                    <div className="no-conversations-found">
                        NO CONVERSATIONS FOUND
                    </div>
                </div>
            );
        }

        if (conversationsState.hasFetched && !selectedConversationId) {
            return (
                <div className={`messages-comp ${className || ''}`}>
                    <div className="select-conversation">
                        PLEASE SELECT A CONVERSATION
                    </div>
                </div>
            );
        }

        if (!conversationsState.hasFetched || !messagesState.hasFetched)
        {
            return (
                <div className={`messages-comp ${className || ''}`}>
                    <div className="wait"><i className="icon-spinner animate-spin"></i></div>
                </div>
            );
        }


        // need to reverse it, because we are using flex-direction: column-reverse
        // to display messages
        const messages = messagesState.messages.slice().reverse();

        const messagesUi = messages.map(
            x => <Message message={x} />
        );

        return (
            <div className={`messages-comp ${className || ''}`}>
                { messagesUi }
            </div>
        );
    }
});


const Message = ({
    className,
    message,
    ...others
}) => {
    const profilePic = message.senderProfilePic || defaultAvatarUrl;
    const profilePicStyle = {
        backgroundImage: `url(${profilePic})`,
    };
    const textElems = (message.text || '').split('\n\n').map((x, i) => <p key={i}>{x}</p>);
    return (
        <div className={`message ${className || ''}`} {...others} >
            <div className="profile-pic" style={profilePicStyle} />
            <div className="name-and-content">
                <div className="name">
                    { message.senderName || 'UNKNOWN' }
                </div>
                <Cards
                    cards={message.cards}
                />
                <div className="text">
                    { textElems }
                </div>
                <Actions
                    actions={message.actions}
                />
            </div>
            <div className="date">
                { simpleTimeFormat(message.creationTimestamp) }
            </div>

        </div>
    );
};

const Actions = ({
    className,
    actions,
    ...others
}) => {
    if (!actions || actions.length === 0) return null;

    const actionsUi = actions.map((x, i) => (
        <div key={i} className="simple-action">
            { x.text }
        </div>
    ));

    return (
        <div className={`simple-actions-root ${className || ''}`} {...others} >
            { actionsUi }
        </div>
    );

};

const Cards = ({
    className,
    cards,
    ...others
}) => {
    if (!cards || cards.length === 0) return null;

    const cardsUi = cards.map((x, i) => {
        // const imgStyle = {
        //     backgroundImage: `url(${x.file})`,
        // };
        return (
            <div key={i} className="card">
                {
                    x.imageUrl && <img className="image" src={x.imageUrl}/>
                }
                <div className="title">
                    {x.title}
                </div>
                <div className="subtitle">
                    {x.subtitle}
                </div>
                {
                    x.actions && x.actions.map((a, j) => (
                        <div key={j} className="button">
                            {a.text}
                        </div>
                    ))
                }
            </div>
        );
    });

    return (
        <div className={`cards-root ${className || ''}`} {...others} >
            { cardsUi }
        </div>
    );

};


export default Messages;
