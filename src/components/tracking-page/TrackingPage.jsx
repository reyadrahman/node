import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import {Alert} from 'react-bootstrap';

let TrackingPage = React.createClass({
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
        } else if (user.botsState.errorCode) {
            if (this.state.error !== user.botsState.errorCode) {
                this.setState({error: user.botsState.errorCode, loading: false})
            }
        }
    },

    componentDidMount(){
        this.setBot();
    },

    componentDidUpdate() {
        if (!this.props.currentUser.signedIn) {
            return;
        }

        this.setBot();
    },

    render() {
        const {className, currentUser} = this.props;
        let content;

        if (currentUser.signedIn) {
            if (this.state.bot) {
                if (this.state.bot.settings.dashbotId) {
                    content = (
                        <iframe src={`https://www.dashbot.io/reports/${this.state.bot.settings.dashbotId}/`}></iframe>
                    );
                } else {
                    content = (
                        <Alert bsStyle="danger">
                            Bot configuration is missing dashbotId
                            Please enter it on <Link to="/settings">settings page</Link>
                        </Alert>
                    );
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
            <div className={`tracking-page-comp ${className || ''}`}>
                {content}
            </div>
        );
    }
});

TrackingPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {}
)(TrackingPage);

TrackingPage = withRouter(TrackingPage);


export default TrackingPage;
