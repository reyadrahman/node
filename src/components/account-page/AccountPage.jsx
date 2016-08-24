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
        const { className, styles, styles: { accountPage: ss },
                currentUser, i18n: { strings: { accountPage: strings } },
        } = this.props;
        if (!currentUser || !currentUser.attributes) {
            return null;
        }

        const { userAttrs, newPassword, oldPassword } = this.state;

        const successMessage = currentUser.updateUserAttrsAndPassSuccessMessage;
        const errorMessage = currentUser.updateUserAttrsAndPassErrorMessage;

        const profileInfoUi = (
            <Form
                className={ss.profileForm}
                onSubmit={this.saveProfileInfo}
                styles={styles}
            >
                <div className={ss.inputsRow}>
                    <label>{strings.givenName}</label>
                    <Input
                        className={ss.field}
                        value={userAttrs.given_name}
                        onChange={e => this.profileAttributeChanged(e, 'given_name')}
                        styles={styles}
                        icon="icon-user"
                    />
                </div>
                <div className={ss.inputsRow}>
                    <label>{strings.familyName}</label>
                    <Input
                        className={ss.field}
                        value={userAttrs.family_name}
                        onChange={e => this.profileAttributeChanged(e, 'family_name')}
                        styles={styles}
                        icon="icon-user"
                    />
                </div>
                <div className={ss.inputsRow}>
                    <label>{strings.phoneNumber}</label>
                    <Input
                        className={ss.field}
                        value={userAttrs.phone_number}
                        onChange={e => this.profileAttributeChanged(e, 'phone_number')}
                        styles={styles}
                        icon="icon-phone"
                    />
                </div>
                <div className={ss.inputsRow}>
                    <label>{strings.newPassword}</label>
                    <Input
                        className={ss.field}
                        value={newPassword}
                        onChange={this.newPasswordChanged}
                        styles={styles}
                        icon="icon-lock"
                        type='password'
                    />
                </div>
                {
                    newPassword &&
                        <div className={ss.inputsRow}>
                            <label>{strings.oldPassword}</label>
                            <Input
                                className={ss.field}
                                value={oldPassword}
                                onChange={this.oldPasswordChanged}
                                styles={styles}
                                icon="icon-lock"
                                type='password'
                            />
                        </div>
                }
                {
                    errorMessage &&
                        <ErrorMessage message={errorMessage} styles={styles} />
                }
                {
                    successMessage &&
                        <SuccessMessage message={successMessage} styles={styles} />
                }
                <ButtonArea styles={styles} className={ss.profileInfoButtonArea}>
                    <Button
                        className={ss.profileInfoSaveButton}
                        label={strings.save}
                        styles={styles}
                        type='submit'
                    />
                </ButtonArea>
            </Form>
        );




        const botsState = currentUser && currentUser.botsState;

        const fetchingBots = botsState && botsState.isFetchingBotsState &&
            // TODO Multi ling
            <h2 className={ss.fetchingBots}>{strings.fetching}</h2>;
        let botGridUi;
        if (botsState && botsState.bots) {
            const { bots } = botsState;
            botGridUi = (
                <div className={ss.botGrid}>
                    <div className={ss.headerRow}>
                        <div className={ss.nameHCell}>{strings.name}</div>
                        <div className={ss.typeHCell}>{strings.type}</div>
                        <div className={ss.webhookUrlsHCell}>{strings.webhookUrls}</div>
                    </div>
                    {
                        bots.map((x, i) => (
                            <div key={i} className={ss.contentRow}>
                                <div className={ss.nameCell}>
                                    { x.botName }
                                </div>
                                <div className={ss.typeCell}>
                                    { /* TODO type */ }
                                    TODO
                                </div>
                                <div className={ss.webhookUrlsCell}>
                                    <a
                                        href="javascript:void(0)"
                                        className={ss.showBot}
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
        const emptyBotList = (botGridUi && botGridUi.length === 0) &&
            <h2 className={ss.emptyBotList}>You don't have any bots yet</h2>;

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <div className={ss.profileSection}>
                    <h1>{strings.profile}</h1>
                    {
                        profileInfoUi
                    }
                </div>
                <div className={ss.botSection}>
                    <h1>{strings.bots}</h1>
                    {
                        fetchingBots || emptyBotList || botGridUi
                    }
                    <Form className={ss.addBotForm} styles={styles} onSubmit={this.addBot}>
                        <ButtonArea styles={styles}>
                            <Button
                                className={ss.addBotButton}
                                label={strings.addBot}
                                styles={styles}
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
    bot, i18n: { strings: { accountPage: strings } },
    styles, styles: { accountPage: ss }, onRequestClose,
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
            <Title styles={styles} title={strings.webhookUrls} />
            <Form
                className={ss.botWebhookUrlList}
                onSubmit={onRequestClose}
                buttons={buttons}
                styles={styles}
            >
                {
                    chans.map(c => (
                        <div className={ss.channel}>
                            <div className={ss.channelName}>
                                { c[0] }
                            </div>
                            <div className={ss.channelWebhookUrl}>
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
