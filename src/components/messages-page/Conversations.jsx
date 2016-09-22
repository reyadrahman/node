/* @flow */

import React from 'react';
import _ from 'lodash';

import { simpleTimeFormat } from '../../misc/utils.js';
// $FlowFixMe
import defaultAvatarUrl from '../../public/avatar.jpg';

let Conversations = React.createClass({
    getInitialState() {
        return {
        };
    },

    render() {
        const { className, selectedConversationId, currentUser,
                i18n: { strings: { conversations: strings } }
              } = this.props;

        const { conversationsState: cs } = currentUser;
        if (!cs.hasFetched || _.isEmpty(cs.conversations)) {
            return (
                <div className={`conversations-comp ${className || ''}`}>
                    <div className="wait">•••</div>
                </div>
            );
        }

        const convsUi = cs.conversations.map((x, i) => {
            const profilePic = x.lastMessage.senderProfilePic || defaultAvatarUrl;
            const profilePicStyle = {
                backgroundImage: `url(${profilePic})`,
            };
            let text = x.lastMessage.text || '';
            if (text.length > 20) {
                text = text.substr(0, 17) + '...';
            }
            let extraClass = x.conversationId === selectedConversationId
                ? 'selected' : '';
            return (
                <div
                    key={i}
                    className={`conversation ${extraClass}`}
                    onClick={() => this.props.onSelectConversation(x.conversationId)}
                >
                    <div className="profile-pic" style={profilePicStyle} />
                    <div className="conversation-name-and-text">
                        <div className="name">
                            { x.lastMessage.senderName || 'UNKNOWN' }
                        </div>
                        <div className="text">
                            { text }
                        </div>
                    </div>
                    <div className="date">
                        { simpleTimeFormat(x.lastMessage.creationTimestamp) }
                    </div>
                </div>
            );
        });


        return (
            <div className={`conversations-comp ${className || ''}`}>
                { convsUi }
            </div>
        );
    }
});


export default Conversations;
