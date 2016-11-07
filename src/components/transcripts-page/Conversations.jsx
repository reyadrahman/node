/* @flow */

import React from 'react';
import _ from 'lodash';

import { simpleTimeFormat, decomposeKeys } from '../../misc/utils.js';
// $FlowFixMe
import defaultAvatarUrl from '../../resources/avatar.jpg';

let Conversations = React.createClass({
    getInitialState() {
        return {
            searchFilter: '',
            scrollToConversation: false,
        };
    },

    componentDidMount(){
        if (this.props.selectedConversationId) {
            this.setState({scrollToConversation: true});
        }
    },

    componentDidUpdate(){
        if (this.state.scrollToConversation && this.refs.activeConversation) {
            if (this.refs.activeConversation.scrollIntoView) {
                this.refs.activeConversation.scrollIntoView();
            }
            this.setState({scrollToConversation: false});
        }
    },

    onFilterChange: function (event) {
        this.setState({searchFilter: event.target.value});
    },

    render() {
        const { className, selectedConversationId, currentUser,
                i18n: { strings: { conversations: strings } }
              } = this.props;

        const { conversationsState: cs } = currentUser;
        if (!cs.hasFetched && !cs.errorCode) {
            return (
                <div className={`conversations-comp ${className || ''}`}>
                    <div className="wait"><i className="icon-spinner animate-spin"></i></div>
                </div>
            );
        } else if (_.isEmpty(cs.conversations)) {
            return (
                <div></div>
            );
        }

        let searchFilter  = this.state.searchFilter;
        let conversations = cs.conversations;

        if (searchFilter) {
            conversations = conversations.filter(
                conversation => {
                    const pns = (conversation.participantsNames || {});
                    const names = pns && (pns.values || []).join(' ').toLowerCase() || '';
                    const lm = conversation.lastMessage;
                    const text = lm && (lm.text || '').toLowerCase();
                    return names.includes(searchFilter) || text.includes(searchFilter);
                }
            );
        }

        const convsUi = conversations.map((x, i) => {
            const profilePic = x.lastParticipantProfilePic || defaultAvatarUrl;
            const profilePicStyle = {
                backgroundImage: `url(${profilePic})`,
            };
            let text = x.lastMessage.text || '';
            if (text.length > 20) {
                text = text.substr(0, 17) + '...';
            }
            const [, conversationId] = decomposeKeys(x.botId_conversationId);

            let extraClass = '', props = {};
            if (conversationId === selectedConversationId) {
                extraClass = 'selected';
                props.ref  = 'activeConversation';
            }

            let conversationTitle = _.get(x, 'participantsNames.values', []).join(', ');
            if (!conversationTitle) {
                conversationTitle = '---';
            }
            if (conversationTitle.length > 20) {
                conversationTitle = conversationTitle.substr(0,17) + '...';
            }

            return (
                <div
                    key={i}
                    className={`conversation ${extraClass}`}
                    onClick={() => this.props.onSelectConversation(conversationId)}
                    {...props}
                >
                    <div className="profile-pic" style={profilePicStyle} />
                    <div className="conversation-name-and-text">
                        <div className="name">
                            { conversationTitle }
                        </div>
                        <div className="text">
                            { text }
                        </div>
                        <div className="text-right">
                            <small>via</small> <b>{ x.channel }</b>
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
                <div className="input-group">
                    <input type="text" name="filter"
                           className="form-control" value={ searchFilter }
                           onChange={this.onFilterChange}
                           placeholder="Search..."/>
                    <div className="input-group-addon"><i className="icon-search"></i></div>
                </div>
                <div className="conversations">
                    { convsUi }
                </div>
            </div>
        );
    }
});


export default Conversations;
