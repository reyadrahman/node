/* @flow */

import React from 'react';

import { simpleTimeFormat } from '../../misc/utils.js';
// $FlowFixMe
import defaultAvatarUrl from '../../public/avatar.jpg';

let Conversations = React.createClass({
    getInitialState() {
        return {
        };
    },

    render() {
        const { className, styles, styles: { conversations: ss },
                selectedConversationId, currentUser,
                i18n: { strings: { conversations: strings } }
              } = this.props;

        const { conversationsState: cs } = currentUser;
        if (!cs || !cs.conversations || cs.conversations.length === 0 || cs.isFetchingConversationsState) {
            return (
                <div className={`${ss.root} ${className || ''}`}>
                    <div className={ss.wait}>•••</div>
                </div>
            );
        }

        const { conversations: convs } = cs;

        const convsUi = convs.map((x, i) => {
            const profilePic = x.lastMessage.senderProfilePic || defaultAvatarUrl;
            const profilePicStyle = {
                backgroundImage: `url(${profilePic})`,
            };
            let text = x.lastMessage.text || '';
            if (text.length > 20) {
                text = text.substr(0, 17) + '...';
            }
            let extraClass = x.conversationId === selectedConversationId
                ? ss.selected : '';
            return (
                <div
                    key={i}
                    className={`${ss.conversation} ${extraClass}`}
                    onClick={() => this.props.onSelectConversation(x.conversationId)}
                >
                    <div className={ss.profilePic} style={profilePicStyle} />
                    <div className={ss.conversationNameAndText}>
                        <div className={ss.name}>
                            { x.lastMessage.senderName || 'UNKNOWN' }
                        </div>
                        <div className={ss.text}>
                            { text }
                        </div>
                    </div>
                    <div className={ss.date}>
                        { simpleTimeFormat(x.lastMessage.creationTimestamp) }
                    </div>
                </div>
            );
        });


        return (
            <div className={`${ss.root} ${className || ''}`}>
                {
                    convsUi
                }
            </div>
        );
    }
});


export default Conversations;
