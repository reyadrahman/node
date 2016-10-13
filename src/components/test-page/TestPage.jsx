import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import {Alert} from 'react-bootstrap';

let TestPage = React.createClass({
    getInitialState(){
        return {
            bot:     null,
            loading: true,
            error:   null
        };
    },

    setBot() {
        const user = this.props.currentUser;

        if (user.botsState.hasFetched) {
            if (user.selectedBotId && (!this.state.bot || this.state.bot.botId !== user.selectedBotId)) {
                let bot = _.cloneDeep(_.find(user.botsState.bots, {botId: user.selectedBotId}));
                this.setState({bot, loading: false});
            }
        } else if (user.botsState.errorMessage) {
            if (this.state.error !== user.botsState.errorMessage) {
                this.setState({error: user.botsState.errorMessage, loading: false})
            }
        }
    },

    componentDidMount(){
        if (this.props.bot) {
            this.setState({bot: this.props.bot, loading: false});
        } else {
            this.setBot();
        }
    },

    componentDidUpdate(oldProps) {
        if (!this.props.currentUser.signedIn || this.props.public) {
            return;
        }

        this.setBot();
    },

    render() {
        const {className, currentUser} = this.props;
        let content;

        if (this.props.public || currentUser.signedIn) {
            if (this.state.bot) {
                if (this.state.bot.settings.secretWebchatCode) {
                    content = (
                        <iframe
                            src={`https://webchat.botframework.com/embed/botframework?s=${this.state.bot.settings.secretWebchatCode}`}
                            frameborder="0"></iframe>
                    );
                } else {
                    content = <Alert bsClass="danger">Bot configuration is missing webchat secret code</Alert>
                }
            } else if (this.state.loading) {
                content = <div className="wait"><i className="icon-spinner animate-spin"/></div>;
            } else if (this.state.error) {
                content = <Alert bsStyle="danger">{this.state.error}</Alert>;
            } else {
                content = <Alert bsStyle="danger">Page load failed for unexpected reason</Alert>;
            }
        } else {
            content = <Alert bsClass="danger">You are not allowed to view this page</Alert>
        }

        return (
            <div className={`test-page-comp ${className || ''}`}>
                {content}
            </div>
        );
    }
});

TestPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        selectBot: actions.selectBot,
    }
)(TestPage);

TestPage = withRouter(TestPage);


export default TestPage;
