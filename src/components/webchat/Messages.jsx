/* @flow */

import {simpleTimeFormat} from '../../misc/utils.js';

import React from 'react';

// $FlowFixMe
import defaultAvatarUrl from '../../resources/avatar.jpg';

let Messages = React.createClass({
    handleAction: function(action){
        this.props.handleAction(action);
    },

    componentDidUpdate: function () {
        if (this.props.messages.length) {
            let messageElements = this.refs.messages.getElementsByClassName('message');
            if (messageElements.length > 2) {
                let lastMessage = messageElements[messageElements.length - 1];
                lastMessage.scrollIntoView && lastMessage.scrollIntoView();
            }
        }
    },

    render() {
        return (
            <div ref="messages" className={`messages-comp ${this.props.className || ''}`}>
                { this.props.messages.map(
                    (message, i) => <Message message={message} handleAction={this.handleAction}/>
                ) }
            </div>
        );
    }
});


const Message = ({
    className,
    message,
    handleAction,
    ...others
}) => {
    const profilePic      = message.senderProfilePic || defaultAvatarUrl;
    const profilePicStyle = {
        backgroundImage: `url(${profilePic})`,
    };

    const textElems = (message.text || '').split('\n\n').map((x, i) => <p key={i}>{x}</p>);
    return (
        <div className={`message ${className || ''}`} {...others} >
            <div className="profile-pic" style={profilePicStyle}/>
            <div className="name-and-content">
                <div className="name">
                    { message.senderName || 'UNKNOWN' }
                </div>
                <Cards
                    cards={message.cards}
                    handleAction={handleAction}

                />
                <div className="text">
                    { textElems }
                </div>
                <Actions
                    actions={message.actions}
                    handleAction={handleAction}
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
    handleAction,
    ...others
}) => {
    if (!actions || actions.length === 0) return null;

    const actionsUi = actions.map((a, i) => (
        <div key={i} className="simple-action action" onClick={() => handleAction(a)}>
            { a.text }
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
    handleAction,
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
                        <div key={j} className="button action" onClick={() => handleAction(a)}>
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
