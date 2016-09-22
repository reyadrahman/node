/* @flow */

import React from 'react';

import { simpleTimeFormat } from '../../misc/utils.js';
// $FlowFixMe
import defaultAvatarUrl from '../../public/avatar.jpg';

let Messages = React.createClass({
    render() {
        const { className, selectedConversationId, currentUser, noConversationsFound,
                isFetchingConversationsState, i18n: { strings: { messages: strings } }
              } = this.props;

        if (noConversationsFound) {
            return (
                <div className={`messages-comp ${className || ''}`}>
                    <div className="no-conversations-found">
                        NO CONVERSATIONS FOUND
                    </div>
                </div>
            );
        }

        const { messagesCacheState: mcs } = currentUser;
        const mc = mcs && mcs.messagesCache;

        if (!isFetchingConversationsState && !selectedConversationId) {
            return (
                <div className={`messages-comp ${className || ''}`}>
                    <div className="select-conversation">
                        PLEASE SELECT A CONVERSATION
                    </div>
                </div>
            );
        }

        if (isFetchingConversationsState || !mc || !mc[selectedConversationId] ||
            mcs.isFetchingMessagesCacheState)
        {
            return (
                <div className={`messages-comp ${className || ''}`}>
                    <div className="wait">•••</div>
                </div>
            );
        }





        // need to reverse it, because we are using flex-direction: column-reverse
        // to display messages
        const messages = mc[selectedConversationId].slice().reverse();

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
                    { message.text }
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
                <img className="image" src={x.imageUrl} />
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
