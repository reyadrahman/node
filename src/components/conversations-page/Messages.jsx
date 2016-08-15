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
                selectedConversationId, currentUser,
                i18n: { strings: { messages: strings } }
              } = this.props;

        const { messagesCacheState: mcs } = currentUser;

        const mc = mcs && mcs.messagesCache;

        if (!selectedConversationId || !mc || !mc[selectedConversationId]) {
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
            <div
                ref={ e => this._dom = e }
                className={`${ss.root} ${className || ''}`}
            >
                { messagesUi }
            </div>
        );
    }
});


const Message = ({
    className,
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
            </div>
            <div className={ss.date}>
                { simpleTimeFormat(message.creationTimestamp) }
            </div>

        </div>
    );
};




export default Messages;
