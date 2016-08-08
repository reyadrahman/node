import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

let BotsPage = React.createClass({
    getInitialState() {
        return {
        };
    },
    // send(e) {
    //     e.preventDefault();
    //     // TODO
    // },
    // botNameChanged(e) {
    //     this.setState({ botName: e.target.value });
    // },
    addBot(e) {
        e.preventDefault();
        this.props.router.push('/add-bot');
    },

    componentDidMount() {
        const { currentUser: cu, fetchBots } = this.props;
        if (cu) {
            fetchBots();
        }
    },

    render() {
        const { className, styles, styles: { botsPage: ss },
                currentUser, i18n: { strings: { bots: strings } },
                /*successMessage, errorMessage*/ } = this.props;
        // const { state } = this;

        if (!currentUser || !currentUser.attributes || !currentUser.attributes.sub) {
            return <h3>Please log in</h3>;
        }

        const botsState = currentUser && currentUser.botsState;

        const fetchingBots = botsState && botsState.isFetchingBotsState &&
            <div>Fetching bots...</div>;
        const botList = botsState && botsState.bots &&
            <table>
                <tr>
                    <th>{strings.botName}</th>
                    <th>Webhook Base URL</th>
                </tr>
                {
                    botsState.bots.map(x => {
                        return (
                            <tr>
                                <td>{x.botName}</td>
                                <td>
                                    {
                                        window.location.origin +
                                        '/webhooks/' +
                                        x.publisherId + '/' +
                                        x.botId + '/XXX'
                                    }
                                </td>
                            </tr>
                        );
                    })
                }
            </table>
        const emptyBotList = (botList && botList.length === 0) &&
            <div>You have no bots</div>;


        return (
            <div className={`${ss.root} ${className || ''}`}>
                {
                    fetchingBots || emptyBotList || botList
                }
                <Form styles={styles} onSubmit={this.addBot}>
                    <Button
                        className={ss.addBotButton}
                        label={strings.addBot}
                        styles={styles}
                        type='submit'
                    />
                </Form>
            </div>
        );
    }
});

BotsPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        fetchBots: actions.fetchBots,
    }
)(BotsPage);

BotsPage = withRouter(BotsPage);

export default BotsPage;
