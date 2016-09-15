/* @flow */

import Component from '../../../front-end-framework/component.js';
import Conversations from './conversations.js';
import Messages from './messages.js';
import type { AdminAppProps } from '../types.js';

type RenderProps = {
    className: string,
};

type Params = {
    conversationId?: string,
};

import '../less/messages-page.less';

export default class MessagesPage extends Component<AdminAppProps> {
    params: Object;

    constructor(props: AdminAppProps, params: Params) {
        super(props);
        console.log('MessagesPage params: ', params);
        this.params = params;
    }

    componentDidMount() {
        super.componentDidMount();
    }

    routeParamsChanged(newParams: Params) {
        console.log('MessagesPage newParams: ', newParams);
        this.getChild('conversations').conversationIdChanged(newParams.conversationId);
        this.getChild('messages').conversationIdChanged(newParams.conversationId);
    }

    conversationSelected(conversationId: string) {
        this.props.history.push(`/admin/messages/${conversationId}`);
    }

    render(renderProps?: RenderProps) {
        if (!renderProps) {
            throw new Error('MessagesPage: missing renderProps');
        }
        console.log('MessagesPage render');
        const { className } = renderProps;
        // const state = this.props.stateCursor.get();

        this.unmountChildren();
        const conversationsUi = this.addChild(
            new Conversations(this.props, {
                conversationId: this.params.conversationId,
                onConversationSelected: id => this.conversationSelected(id),
            }),
            'conversations'
        );

        const messagesUi = this.addChild(
            new Messages(this.props, {
                conversationId: this.params.conversationId,
            }),
            'messages'
        );

        return (`
            <div id="page-wrapper" class="messages-page ${className}">
                <div class="leftRightSplit">
                    ${conversationsUi.render()}
                    ${messagesUi.render()}
                </div>
            </div>
        `);
    }
}

