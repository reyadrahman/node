/* @flow */

import Component from '../../../front-end-framework/component.js';
import Conversations from './conversations.js';
import Messages from './messages.js';
import type { AdminAppContext, AdminAppSubPageProps } from '../types.js';

type Params = {
    conversationId?: string,
};

type Props = AdminAppSubPageProps & {
    params: Params,
};

import '../less/messages-page.less';

export default class MessagesPage extends Component<AdminAppContext, Props> {
    routeParamsChanged(newParams: Params) {
        console.log('MessagesPage newParams: ', newParams);
        this.getChild('conversations').conversationIdChanged(newParams.conversationId);
        this.getChild('messages').conversationIdChanged(newParams.conversationId);
    }

    conversationSelected(conversationId: string) {
        this.context.history.push(`/admin/messages/${conversationId}`);
    }

    render() {
        console.log('MessagesPage render');
        const { className } = this.props;
        // const state = this.props.stateCursor.get();

        this.unmountChildren();
        const conversationsUi = this.addChild(
            new Conversations(this.context, {
                conversationId: this.props.params.conversationId,
                onConversationSelected: id => this.conversationSelected(id),
            }),
            'conversations'
        );

        const messagesUi = this.addChild(
            new Messages(this.context, {
                conversationId: this.props.params.conversationId,
            }),
            'messages'
        );

        return (`
            <div id="messages-page" class="${className} page-wrapper">
                <div class="leftRightSplit">
                    ${conversationsUi.render()}
                    ${messagesUi.render()}
                </div>
            </div>
        `);
    }
}

