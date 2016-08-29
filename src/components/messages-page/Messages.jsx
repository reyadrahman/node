/* @flow */

import React from 'react';

import { simpleTimeFormat } from '../../misc/utils.js';
// $FlowFixMe
import defaultAvatarUrl from '../../public/avatar.jpg';

let Messages = React.createClass({
    // _dom: null,
    //
    // getInitialState() {
    //
    //     return {
    //     };
    // },
    //
    // componentDidMount() {
    //     this.scrollToBottom();
    // },
    //
    // componentDidUpdate(prevProps) {
    //     if (prevProps.currentUser !== this.props.currentUser) {
    //         this.scrollToBottom();
    //     }
    // },
    //
    // scrollToBottom() {
    //     // if (!this._dom) return;
    //     // this._dom.scrollTop = this._dom.scrollHeight;
    // },

    render() {
        const { className, styles, styles: { messages: ss },
                selectedConversationId, currentUser, noConversationsFound,
                isFetchingConversationsState,
                i18n: { strings: { messages: strings } }
              } = this.props;

        if (noConversationsFound) {
            return (
                <div className={`${ss.root} ${className || ''}`}>
                    <div className={ss.noConversationsFound}>
                        NO CONVERSATIONS FOUND
                    </div>
                </div>
            );
        }

        const { messagesCacheState: mcs } = currentUser;
        const mc = mcs && mcs.messagesCache;

        if (!isFetchingConversationsState && !selectedConversationId) {
            return (
                <div className={`${ss.root} ${className || ''}`}>
                    <div className={ss.selectConversation}>
                        PLEASE SELECT A CONVERSATION
                    </div>
                </div>
            );
        }

        if (isFetchingConversationsState || !mc || !mc[selectedConversationId] ||
            mcs.isFetchingMessagesCacheState)
        {
            return (
                <div className={`${ss.root} ${className || ''}`}>
                    <div className={ss.wait}>•••</div>
                </div>
            );
        }





        // need to reverse it, because we are using flex-direction: column-reverse
        // to display messages
        const messages = mc[selectedConversationId].slice().reverse();

        const messagesUi = messages.map(
            x => <Message styles={styles} message={x} />
        );

        return (
            <div className={`${ss.root} ${className || ''}`}>
                { messagesUi }
            </div>
        );
    }
});


const Message = ({
    className,
    styles,
    styles: { messages: ss },
    message,
    ...others
}) => {
    const profilePic = message.senderProfilePic || defaultAvatarUrl;
    const profilePicStyle = {
        backgroundImage: `url(${profilePic})`,
    };
    return (
        <div className={`${ss.message} ${className || ''}`} {...others} >
            <div className={ss.profilePic} style={profilePicStyle} />
            <div className={ss.nameAndContent}>
                <div className={ss.name}>
                    { message.senderName || 'UNKNOWN' }
                </div>
                <Cards
                    cards={message.cards}
                    styles={styles}
                />
                <div className={ss.text}>
                    { message.text }
                </div>
                <Actions
                    actions={message.actions}
                    styles={styles}
                />
            </div>
            <div className={ss.date}>
                { simpleTimeFormat(message.creationTimestamp) }
            </div>

        </div>
    );
};

const Actions = ({
    className,
    styles,
    styles: { messages: ss },
    actions,
    ...others
}) => {
    if (!actions || actions.length === 0) return null;

    const actionsUi = actions.map((x, i) => (
        <div key={i} className={ss.simpleAction}>
            { x.text }
        </div>
    ));

    return (
        <div className={`${ss.simpleActionsRoot} ${className || ''}`} {...others} >
            { actionsUi }
        </div>
    );

};

const Cards = ({
    className,
    styles,
    styles: { messages: ss },
    cards,
    ...others
}) => {
    if (!cards || cards.length === 0) return null;

    const cardsUi = cards.map((x, i) => {
        // const imgStyle = {
        //     backgroundImage: `url(${x.file})`,
        // };
        return (
            <div key={i} className={ss.card}>
                <img className={ss.image} src={x.imageUrl} />
                <div className={ss.title}>
                    {x.title}
                </div>
                <div className={ss.subtitle}>
                    {x.subtitle}
                </div>
                {
                    x.actions && x.actions.map((a, j) => (
                        <div key={j} className={ss.button}>
                            {a.text}
                        </div>
                    ))
                }
            </div>
        );
    });

    return (
        <div className={`${ss.cardsRoot} ${className || ''}`} {...others} >
            { cardsUi }
        </div>
    );

};


export default Messages;
