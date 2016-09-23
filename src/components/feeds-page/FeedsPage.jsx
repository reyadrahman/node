import React from 'react';
// import { Form, Input, Button, ButtonArea, TextArea, SuccessMessage,
//          ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../app-state/actions.js';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import { leftPad, splitOmitWhitespace } from '../../misc/utils.js';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import { Glyphicon, Button, Dropdown, MenuItem, Table, FormGroup, InputGroup,
         FormControl, DropdownButton, ControlLabel, HelpBlock } from 'react-bootstrap';
import _ from 'lodash';

let FeedsPage = React.createClass({
    newFeed(e) {
        const close = e => {
            e.preventDefault();
            this.props.closeModal();
        };

        this.props.setModal(props => <NewFeed {...props} onRequestClose={close} />);
    },

    newBot() {
        this.props.router.push('/add-bot');
    },

    render() {
        const { className, currentUser, i18n: { strings: { feedsPage: strings } } } = this.props;
        if (!currentUser.signedIn) {
            return null;
        }

        const wrapPage = content => (
            <div className={`feeds-page-comp ${className || ''}`}>
                { content }
            </div>
        );

        const wrapFeedsSection = content => (
            <div className="feeds-section">
                <h1>{strings.feeds}</h1>
                { content }
            </div>
        );

        const newFeedButton = (
            <Button className="new-feed-button" bsSize="large" onClick={this.newFeed}>
                { strings.newFeed }
            </Button>
        );

        const { botsState: { bots, hasFetched }, selectedBotId } = currentUser;

        // is fetching
        if (!hasFetched) {
            return wrapPage(wrapFeedsSection(<h2>{strings.fetchingFeeds}</h2>));
        }

        // no bots
        if (_.isEmpty(bots)) {
            return wrapPage(wrapFeedsSection([
                <h2>{strings.noBots}</h2>,
                <Button className="new-bot-button" bsSize="large" onClick={this.newBot}>
                    { strings.newBot }
                </Button>
            ]));
        }

        const bot = bots.find(x => x.botId === selectedBotId);

        // no feeds
        if (_.isEmpty(bot.feeds)) {
            return wrapPage(wrapFeedsSection([
                <h2>{strings.noFeeds}</h2>,
                newFeedButton,
            ]));
        }

        const cronRegexp = /\* (\d+) \* \* \*/;
        const rowsUi = bot.feeds.map((feed, i) => {
            let source;
            if (feed.type === 'twitter') {
                source = <a href={`https://twitter.com/${feed.twitterScreenName}`}>@{feed.twitterScreenName}</a>;
            } else if (feed.type === 'rss') {
                source = <a href={feed.rssUrl}>RSS</a>;
            }
            const categories = feed.categories ? feed.categories.join(', ') : '';
            const at = leftPad(feed.publishTimePattern.match(cronRegexp)[1], '0', 2) + ':00';
            return (
                <tr key={i}>
                    <td>{ feed.feedName }</td>
                    <td>{ source }</td>
                    <td>{ categories }</td>
                    <td>{ at }</td>
                </tr>
            );
        })

        return wrapPage(
            wrapFeedsSection([
                <Table className="feeds-table" responsive>
                    <thead>
                        <tr>
                            <th>{strings.feedName}</th>
                            <th>{strings.source}</th>
                            <th>{strings.categories}</th>
                            <th>{strings.scheduledEveryDayAt}</th>
                        </tr>
                    </thead>
                    <tbody>
                        { rowsUi }
                    </tbody>
                </Table>,
                newFeedButton
            ])
        );
    }
});


FeedsPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        closeModal: actions.closeModal,
        setModal: actions.setModal,
    }
)(FeedsPage);

FeedsPage = withRouter(FeedsPage);




let NewFeed = React.createClass({
    getInitialState() {
        return {
            feedName: '',
            categories: '',
            type: 'twitter',
            sourceInput: '',
            publishHour: '12',
        }
    },

    createClicked(e) {
        e.preventDefault();
        const s = this.state;
        const feedName = s.feedName.trim();
        const categories = splitOmitWhitespace(s.categories, ',');
        const type = s.type;
        const publishTimePattern = `* ${s.publishHour} * * *`;
        const sourceInput = s.sourceInput.trim();
        const twitterScreenName = type === 'twitter' && sourceInput.match(/@?(.*)/)[1];
        const rssUrl = type === 'rss' && sourceInput;

        // omit falsy items
        const newFeed = _.pickBy({
            feedName, categories, type, twitterScreenName, rssUrl, publishTimePattern,
            feedId: '.', // feedId will be set by the server
        }, Boolean);

        if (feedName && type && sourceInput &&
            (type === 'twitter' && twitterScreenName ||
             type === 'rss' && rssUrl))
        {
            console.log('NewFeed createClicked: ', newFeed);
            this.props.addBotFeed(this.props.currentUser.selectedBotId, newFeed);
            this.props.closeModal();
        }
    },

    fieldChanged(e, field) {
        this.setState({ [field]: e.target.value });
    },

    typeSelected(eventKey) {
        this.setState({ type: eventKey });
    },

    publishHourSelected(event) {
        this.setState({ publishHour: event.target.value });
    },

    render() {
        const { i18n: { strings: { newFeed: strings } }, onRequestClose } = this.props;

        const s = this.state;

        return (
            <div className="new-feed-comp">
                <Title title={strings.newFeedTitle} />
                <form onSubmit={this.createClicked}>
                    <FormGroup>
                        <ControlLabel>{strings.feedName} *</ControlLabel>
                        <FormControl
                            type="text" placeholder={strings.feedNamePlaceholder}
                            onChange={e => this.fieldChanged(e, 'feedName')}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>{strings.categories}</ControlLabel>
                        <FormControl
                            type="text" placeholder={strings.categoriesPlaceholder}
                            onChange={e => this.fieldChanged(e, 'categories')}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>{strings.source} *</ControlLabel>
                        <InputGroup>
                            <DropdownButton
                                componentClass={InputGroup.Button}
                                id="input-dropdown-addon"
                                title={_.capitalize(s.type)}
                                onSelect={this.typeSelected}
                            >
                                <MenuItem eventKey="twitter">Twitter</MenuItem>
                                <MenuItem eventKey="rss">RSS</MenuItem>
                            </DropdownButton>
                            <FormControl
                                type="text"
                                placeholder={ s.type === 'twitter' ? strings.twitterScreenName : strings.rssUrl }
                                onChange={e => this.fieldChanged(e, 'sourceInput')}
                            />
                      </InputGroup>
                    </FormGroup>
                    <FormGroup controlId="formControlsSelect">
                        <ControlLabel>{strings.publishHourLabel}</ControlLabel>
                        <FormControl
                            componentClass="select"
                            value={s.publishHour}
                            className="publish-hour-select"
                            onChange={this.publishHourSelected}
                        >
                            {
                                _.range(0, 24).map(
                                    x => <option value={x}>{ leftPad(x, '0', 2) }:00</option>
                                )
                            }
                        </FormControl>
                    </FormGroup>
                    <HelpBlock>* {strings.requiredField}</HelpBlock>
                    <div className="button-area">
                        <Button bsStyle="primary" bsSize="large" type="submit">{strings.create}</Button>
                    </div>
                </form>
            </div>
        );
    }
});

NewFeed = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        addBotFeed: actions.addBotFeed,
        closeModal: actions.closeModal,
    }
)(NewFeed);


export default FeedsPage;
