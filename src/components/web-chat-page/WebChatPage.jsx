import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

let WebChatPage = React.createClass({
    getInitialState() {
        return {
        };
    },

    componentDidMount() {
        const { webChat, fetchWebChatSessionToken } = this.props;
        if (!webChat || !webChat.sessionToken) {
            fetchWebChatSessionToken();
        }
    },

    componentDidUpdate(oldProps) {
        // TODO check if user just signed in
    },

    render() {
        const { className, styles, styles: { webChatPage: ss },
                webChat, i18n: { strings: { webChatPage: strings } },
                /*successMessage, errorMessage*/ } = this.props;

        if (!webChat || !webChat.sessionToken) {
            return (
                <div className={`${ss.root} ${className || ''}`}>
                    <div className={ss.wait}>•••</div>
                </div>
            );
        }

        const { sessionToken } = webChat;

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <iframe
                    className={ss.webChatFrame}
                    src={`https://webchat.botframework.com/embed/botframework?t=${sessionToken}`}
                />
            </div>
        );
    }
});

WebChatPage = connect(
    state => ({
        webChat: state.webChat,
    }),
    {
        fetchWebChatSessionToken: actions.fetchWebChatSessionToken,
    }
)(WebChatPage);

WebChatPage = withRouter(WebChatPage);

export default WebChatPage;
