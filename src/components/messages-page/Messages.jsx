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

        if (isFetchingConversationsState || !mc || mcs.isFetchingMessagesCacheState) {
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
    // TODO quickReplies

    const profilePic = message.senderProfilePic || defaultAvatarUrl;
    const profilePicStyle = {
        backgroundImage: `url(${profilePic})`,
    };
    return (
        <div className={`${ss.message} ${className || ''}`} {...others} >
            <div className={ss.profilePic} style={profilePicStyle} />
            <div className={ss.nameAndContent}>
                <div className={ss.name}>
                    { message.senderName }
                </div>
                <div className={ss.text}>
                    { message.text }
                </div>
                <div className={ss.images}>
                    {
                        message.files && message.files.map(x => (
                            <img className={ss.image} src={x} />
                        ))
                    }
                </div>
                <QuickReplies
                    quickReplies={message.quickReplies}
                    styles={styles}
                />

            </div>
            <div className={ss.date}>
                { simpleTimeFormat(message.creationTimestamp) }
            </div>

        </div>
    );
};

const QuickReplies = ({
    className,
    styles,
    styles: { messages: ss },
    quickReplies,
    ...others
}) => {
    if (!quickReplies) return null;

    const isRichQuickReplies = quickReplies && quickReplies.find(
        x => typeof x === 'object' && x.file);

    let quickRepliesUi;

    if (isRichQuickReplies) {
        const richQuickReplies = quickReplies.map(x => {
            return typeof x === 'string' ? { text: x } : x;
        });

        quickRepliesUi = (
            <div className={ss.richQuickReplies}>
                {
                    richQuickReplies.map(x => {
                        // const imgStyle = {
                        //     backgroundImage: `url(${x.file})`,
                        // };
                        return (
                            <div className={ss.richQuickReply}>
                                <img className={ss.image} src={x.file} />
                                <div className={ss.title}>
                                    {x.title}
                                </div>
                                <div className={ss.subtitle}>
                                    {x.subtitle}
                                </div>
                                <div className={ss.button}>
                                    {x.text}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );

    } else {
        quickRepliesUi = (
            <div className={ss.simpleQuickReplies}>
                {
                    quickReplies.map(x => (
                        <div className={ss.simpleQuickReply}>
                            { x }
                        </div>
                    ))
                }
            </div>
        );

    }

    return (
        <div className={`${ss.quickRepliesRoot} ${className || ''}`} {...others} >
            {quickRepliesUi}
        </div>
    );

};


export default Messages;
