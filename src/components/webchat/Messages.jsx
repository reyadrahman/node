/* @flow */

import {simpleTimeFormat} from '../../misc/utils.js';

import React from 'react';

// $FlowFixMe
import defaultAvatarUrl from '../../resources/avatar.jpg';

let Messages = React.createClass({
    componentDidUpdate: function () {
        if (this.props.messages.length) {
            let messageElements = this.refs.messages.getElementsByClassName('message');
            if (messageElements.length) {
                let lastMessage = messageElements[messageElements.length - 1];
                lastMessage.scrollIntoView && lastMessage.scrollIntoView();
            }
        }
    },

    render() {
        return (
            <div ref="messages" className={`messages-comp ${this.props.className || ''}`}>
                { this.props.messages.map(
                    (message, i) => <Message message={message}/>
                ) }
            </div>
        );
    }
});


const Message = ({
    className,
    message,
    ...others
}) => {
    const profilePic      = message.senderProfilePic || defaultAvatarUrl;
    const profilePicStyle = {
        backgroundImage: `url(${profilePic})`,
    };
    return (
        <div className={`message ${className || ''}`} {...others} >
            <div className="profile-pic" style={profilePicStyle}/>
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
                <img className="image" src={x.imageUrl}/>
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
