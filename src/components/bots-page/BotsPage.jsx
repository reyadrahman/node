import React from 'react';
import { Form, Input, Button, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

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
        if (this.props.currentUser && !this.props.bots) {
            this.props.fetchBots(this.props.currentUser);
        }
    },

    render() {
        const { className, styles, styles: { botsPage: ss },
                publisher, i18n: { strings: { bots: strings } },
                /*successMessage, errorMessage*/ } = this.props;
        // const { state } = this;

        const fetchingBots = publisher.isFetchingBots;
        const botList = publisher.bots && publisher.bots.map(x => {
            return (
                <div>
                    {x.name}
                </div>
            );
        });
        const emptyBotList = (!botList || botList.length === 0) &&
            <div>You have no bots</div>;


        return (
            <div className={`${ss.root} ${className || ''}`}>
                {
                    fetchingBots && emptyBotList && botList
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
        publisher: state.publisher,
    }),
    {
    }
)(BotsPage);

BotsPage = withRouter(BotsPage);

export default BotsPage;
