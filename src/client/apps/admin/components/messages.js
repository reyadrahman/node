/* @flow */

import Component from '../../../front-end-framework/component.js';
import { simpleTimeFormat } from '../../../../misc/utils.js';
import type { AdminAppContext } from '../types.js';
import type { DBMessage, MessageAction, MessageCard } from '../../../../misc/types.js';
import * as actions from '../actions.js';

type Props = {
    conversationId?: string,
};

const defaultAvatarUrl = require('./default-avatar.jpg');

export default class Messages extends Component<AdminAppContext, Props> {
    componentDidMount() {
        if (this.props.conversationId) {
            this.context.dispatchAction(actions.fetchMessages(this.props.conversationId));
        }
        this.context.eventSystem.subscribe(() => this.rerender(),
            ['fetchedMessages', 'fetchingMessages', 'fetchedConversations']);
    }

    conversationIdChanged(conversationId?: string) {
        console.log('Messages conversationIdChanged: ', conversationId);
        this.props = {
            ...this.props,
            conversationId,
        };
        if (this.props.conversationId) {
            this.context.dispatchAction(actions.fetchMessages(this.props.conversationId));
        }
    }

    rerender() {
        console.log('Messages rerender');
        $('#messages').replaceWith(this.render());
        super.componentDidMount();
    }

    renderMessage(m: DBMessage) {
        const profilePic = m.senderProfilePic || defaultAvatarUrl;
        const profilePicStyle = `background-image: url(${profilePic});`
        const cards = this.renderCards(m.cards);
        const actions = this.renderActions(m.actions);
        return `
            <div class="message">
                <div class="profilePic" style="${profilePicStyle}" />
                <div class="nameAndContent">
                    <div class="name">
                        ${ m.senderName || 'UNKNOWN' }
                    </div>
                    ${ cards }
                    <div class="text">
                        ${ m.text || '' }
                    </div>
                    ${ actions }
                </div>
                <div class="date">
                    ${ simpleTimeFormat(m.creationTimestamp) }
                </div>
            </div>
        `;                
    }

    renderActions(actions: MessageAction[]) {
        if (!actions || actions.length === 0) return '';

        const actionsUi = actions.map(x => `
            <div class="simpleAction">
                ${ x.text }
            </div>
        `).join('\n');

        return `
            <div class="simpleActionsRoot">
                ${ actionsUi || '' }
            </div>
        `; 
    }

    renderCards(cards: MessageCard[]) {
        if (!cards || cards.length === 0) return '';

        const cardsUi = cards.map(x => {
            const buttons = x.actions && x.actions.map(a => `
                <div class="button">
                    ${ a.text }
                </div>
            `).join('\n');
            return `
                <div class="card">
                    <img class="image" src="${x.imageUrl}" />
                    <div class="title">
                        ${ x.title || '' }
                    </div>
                    <div class="subtitle">
                        ${ x.subtitle || '' }
                    </div>
                    ${ buttons || '' }
                </div>
            `;
        }).join('\n');

        return `
            <div class="cardsRoot">
                ${ cardsUi }
            </div>
        `; 
    }

    render() {
        const currentUser = this.context.stateCursor.get().currentUser;
        const ms = currentUser.messagesState;
        const cs = currentUser.conversationsState;
        // console.log('s: ', s);
        // console.log('this.props.stateCursor.get(): ', this.props.stateCursor.get());

        this.unmountChildren();

        const wrap = x => `<div class="messages" id="messages">${x}</div>`;

        if (cs.hasFetched && cs.conversations.length === 0) {
            return wrap(`<div class="noConversationsFound">no conversation found</div>`);
        }

        console.log('***** cs.hasFetched: ', cs.hasFetched, ', conversationId: ', this.props.conversationId);
        if (cs.hasFetched && !this.props.conversationId) {
            return wrap(`<div class="selectConversation">Please select a conversation</div>`);
        }

        if (!ms.hasFetched) {
            return wrap(`<div class="wait">•••</div>`);
        }

        const messages = ms.messages[this.props.conversationId];
        if (ms.hasFetched && (!messages || messages.length === 0)) {
            return wrap(`<div class="noMessagesFound">No messages found</div>`);
        }

        // need to reverse it, because we are using flex-direction: column-reverse
        // to display messages
        const messagesRev = messages.slice().reverse();

        const messagesUi = messagesRev
            .map(x => this.renderMessage(x))
            .join('\n');

        return wrap(messagesUi);
    }
}

