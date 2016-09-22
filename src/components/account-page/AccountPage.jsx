import React from 'react';
import { Form, Input, Button, ButtonArea, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
import { Title } from '../modal-box-1/ModalBox1.jsx';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import _ from 'lodash';

const EDITABLE_USER_ATTRIBUTES = [
    'given_name', 'family_name', 'phone_number',
];

let AccountPage = React.createClass({
    getInitialState() {
        return {
            userAttrs: {},
            oldPassword: '',
            newPassword: '',
            isUserAttrsDirty: false,
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

    saveProfileInfo(e) {
        e.preventDefault();
        this.props.updateUserAttrsAndPass(this.state.userAttrs,
                                          this.state.oldPassword,
                                          this.state.newPassword);
    },

    showBot(bot) {
        const { setModalComponent, closeModal } = this.props;
        const close = e => {
            e.preventDefault();
            closeModal();
        };
        setModalComponent(
            props => <BotDetails bot={bot} {...props} onRequestClose={close} />
        );
    },

    profileAttributeChanged(e, field) {
        this.setState({
            userAttrs: {
                ...this.state.userAttrs,
                [field]: e.target.value,
            },
            isUserAttrsDirty: true,
        });
    },

    oldPasswordChanged(e) {
        this.setState({ oldPassword: e.target.value });
    },

    newPasswordChanged(e) {
        this.setState({ newPassword: e.target.value });
    },

    componentWillMount() {
        const { currentUser } = this.props;
        if (currentUser) {
            const attrs = _.pick(currentUser.attributes, EDITABLE_USER_ATTRIBUTES);
            this.setState({
                userAttrs: attrs,
                isUserAttrsDirty: false,
            })
        }
    },

    componentDidMount() {
        const { currentUser: cu, fetchBots } = this.props;
        if (cu) {
            fetchBots();
        }
    },

    componentDidUpdate() {
        // TODO
    },

    render() {
        const { className, currentUser, i18n: { strings: { accountPage: strings } },
        } = this.props;
        if (!currentUser || !currentUser.attributes) {
            return null;
        }

        const { userAttrs, newPassword, oldPassword } = this.state;

        const successMessage = currentUser.updateUserAttrsAndPassSuccessMessage;
        const errorMessage = currentUser.updateUserAttrsAndPassErrorMessage;

        const profileInfoUi = (
            <Form
                className="profile-form"
                onSubmit={this.saveProfileInfo}
            >
                <div className="inputs-row">
                    <label>{strings.givenName}</label>
                    <Input
                        className="field"
                        value={userAttrs.given_name}
                        onChange={e => this.profileAttributeChanged(e, 'given_name')}
                        icon="user"
                    />
                </div>
                <div className="inputs-row">
                    <label>{strings.familyName}</label>
                    <Input
                        className="field"
                        value={userAttrs.family_name}
                        onChange={e => this.profileAttributeChanged(e, 'family_name')}
                        icon="user"
                    />
                </div>
                <div className="inputs-row">
                    <label>{strings.phoneNumber}</label>
                    <Input
                        className="field"
                        value={userAttrs.phone_number}
                        onChange={e => this.profileAttributeChanged(e, 'phone_number')}
                        icon="earphone"
                    />
                </div>
                <div className="inputs-row">
                    <label>{strings.newPassword}</label>
                    <Input
                        className="field"
                        value={newPassword}
                        onChange={this.newPasswordChanged}
                        icon="lock"
                        type='password'
                    />
                </div>
                {
                    newPassword &&
                        <div className="inputs-row">
                            <label>{strings.oldPassword}</label>
                            <Input
                                className="field"
                                value={oldPassword}
                                onChange={this.oldPasswordChanged}
                                icon="lock"
                                type='password'
                            />
                        </div>
                }
                {
                    errorMessage &&
                        <ErrorMessage message={errorMessage} />
                }
                {
                    successMessage &&
                        <SuccessMessage message={successMessage} />
                }
                <ButtonArea className="profile-info-button-area">
                    <Button
                        className="profile-info-save-button"
                        label={strings.save}
                        type='submit'
                    />
                </ButtonArea>
            </Form>
        );




        const botsState = currentUser && currentUser.botsState;

        const fetchingBots = botsState && botsState.isFetchingBotsState &&
            // TODO Multi ling
            <h2 className="fetching-bots">{strings.fetching}</h2>;
        let botGridUi;
        if (botsState && botsState.bots) {
            const { bots } = botsState;
            botGridUi = (
                <div className="bot-grid">
                    <div className="header-row">
                        <div className="name-h-cell">{strings.name}</div>
                        <div className="type-h-cell">{strings.type}</div>
                        <div className="webhook-urls-h-cell">{strings.webhookUrls}</div>
                    </div>
                    {
                        bots.map((x, i) => (
                            <div key={i} className="content-row">
                                <div className="name-cell">
                                    { x.botName }
                                </div>
                                <div className="type-cell">
                                    { /* TODO type */ }
                                    TODO
                                </div>
                                <div className="webhook-urls-cell">
                                    <a
                                        href="javascript:void(0)"
                                        className="show-bot"
                                        onClick={() => this.showBot(x)}
                                    >
                                        {strings.show}
                                    </a>
                                </div>
                            </div>
                        ))

                    }
                </div>
            );

        }
        const emptyBotList = (botsState && botsState.bots && botsState.bots.length === 0) &&
            <h2 className="empty-bot-list">You don't have any bots yet</h2>;

        return (
            <div className={`account-page-comp ${className || ''}`}>
                <div className="profile-section">
                    <h1>{strings.profile}</h1>
                    {
                        profileInfoUi
                    }
                </div>
                <div className="bot-section">
                    <h1>{strings.bots}</h1>
                    {
                        fetchingBots || emptyBotList || botGridUi
                    }
                    <Form className="add-bot-form" onSubmit={this.addBot}>
                        <ButtonArea>
                            <Button
                                className="add-bot-button"
                                label={strings.addBot}
                                type='submit'
                            />
                        </ButtonArea>
                    </Form>
                </div>
            </div>
        );
    }
});

AccountPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        fetchBots: actions.fetchBots,
        updateUserAttrsAndPass: actions.updateUserAttrsAndPass,
        setModalComponent: actions.setModalComponent,
        closeModal: actions.closeModal,
    }
)(AccountPage);

AccountPage = withRouter(AccountPage);


export const BotDetails = ({
    bot, i18n: { strings: { accountPage: strings } }, onRequestClose,
}) => {

    const buttons = [
        { label: strings.ok, type: 'submit' },
    ];
    const baseUrl = `${window.location.origin}/webhooks/` +
                    `${bot.publisherId}/${bot.botId}/`;
    const chans = [
        ['Microsoft Bot Framework', 'ms'],
        ['Facebook Messenger', 'messenger'],
        ['Cisco Spark', 'spark'],
    ];
    return (
        <div>
            <Title title={strings.webhookUrls} />
            <Form
                className="bot-webhook-url-list"
                onSubmit={onRequestClose}
                buttons={buttons}
            >
                {
                    chans.map(c => (
                        <div className="channel">
                            <div className="channelName">
                                { c[0] }
                            </div>
                            <div className="channel-webhook-url">
                                { baseUrl + c[1] }
                            </div>
                        </div>
                    ))
                }
            </Form>
        </div>
    );
};

export default AccountPage;
