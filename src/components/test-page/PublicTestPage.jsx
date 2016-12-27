import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import TestPage from './TestPage';
import {Alert} from 'react-bootstrap';

let PublicTestPage = React.createClass({
    getInitialState(){
        return {
            bot:     null,
            loading: true
        };
    },

    async fetchBot(){
        try {
            let bot = await this.props.fetchBotPublicInfo(
                this.props.params.publisherId,
                this.props.params.botId
            );

            this.setState({bot});
        } catch (e) {
            this.setState({error: e.message});
        } finally {
            this.setState({loading: false});
        }

    },

    componentDidMount(){
        this.fetchBot();
    },

    renderBotImage() {
        if (this.state.bot.botIcon) {
            return (<img src={this.state.bot.botIcon}/>);
        }
        return null;
    },

    render() {
        let content;
        if (this.state.loading) {
            content = <div className="wait"><i className="icon-spinner animate-spin"/></div>;
        } else if (this.state.error) {
            content = (
                <Alert bsStyle="danger">
                    Bot does not exist or is not public
                </Alert>
            );
        } else {
            content = (
                <div className="chat-bot-wrapper">
                    <h1>
                        {this.renderBotImage()}
                        {this.state.bot.botName}
                    </h1>
                    <TestPage public="true" bot={this.state.bot} location={this.props.location}/>
                </div>
            );
        }


        return (
            <div className="public-test-page-comp">
                <div className="content">
                    {content}
                </div>
            </div>
        );
    }
});

PublicTestPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        fetchBotPublicInfo: actions.fetchBotPublicInfo,
    }
)(PublicTestPage);

PublicTestPage = withRouter(PublicTestPage);


export default PublicTestPage;
