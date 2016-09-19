/* @flow */

import Component from '../../../front-end-framework/component.js';
import { simpleTimeFormat } from '../../../../misc/utils.js';
import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';
import * as actions from '../actions.js';

type Props = AdminAppSubPageProps & {
    conversationId?: string,
    onConversationSelected?: Function,
};

const defaultAvatarUrl = require('./default-avatar.jpg');

export default class Conversations extends Component<AdminAppContext, Props> {
    componentDidMount() {
        this.context.dispatchAction(actions.fetchConversations());
        this.context.eventSystem.subscribe(() => this.rerender(), 'fetchedConversations');
        const self = this;
        $(document).on('click', '#conversations .conversation', function() {
            const conversationId = $(this).data('conversation-id');
            console.log('conversation selected: ', conversationId);
            const cb = self.props.onConversationSelected;
            cb && cb(conversationId);
            return false;
        });
    }

    conversationIdChanged(conversationId?: string) {
        const oldProps = this.props;
        this.props = {
            ...oldProps,
            conversationId,
        };
        $(`#conversations .conversation.selected`).removeClass('selected');
        if (conversationId) {
            $(`#conversations .conversation[data-conversation-id='${conversationId}']`).addClass('selected');
        }
    }

    rerender() {
        console.log('Conversations rerender');
        $('#conversations').replaceWith(this.render());
        super.componentDidMount();
    }

    renderConversation(c) {
        const profilePic = c.lastMessage.senderProfilePic || defaultAvatarUrl;
        const profilePicStyle = `background-image: url(${profilePic});`
        let text = c.lastMessage.text || '';
        if (text.length > 20) {
            text = text.substr(0, 17) + '...';
        }
        let extraClass = c.conversationId === this.props.conversationId
            ? 'selected' : '';

        return `
            <div class="conversation ${extraClass}" data-conversation-id="${c.conversationId}">
                <div class="profilePic" style="${profilePicStyle}" />
                <div class="conversationNameAndText">
                    <div class="name">
                        ${ c.lastMessage.senderName || 'UNKNOWN' }
                    </div>
                    <div class="text">
                        ${ text }
                    </div>
                </div>
                <div class="date">
                    ${ simpleTimeFormat(c.lastMessage.creationTimestamp) }
                </div>
            </div>
        `;
    }

    render() {
        const s = this.context.stateCursor.get().currentUser.conversationsState;
        // console.log('s: ', s);
        // console.log('this.context.stateCursor.get(): ', this.context.stateCursor.get());

        this.unmountChildren();

        const wrap = x => `<div class="conversations" id="conversations">${x}</div>`;

        if (!s.hasFetched || s.conversations.length === 0) {
            return wrap(`<div class="wait">•••</div>`);
        }

        const convsUi = s.conversations
            .map(x => this.renderConversation(x))
            .join('\n');

        return wrap(convsUi);
    }
}

