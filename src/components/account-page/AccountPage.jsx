import React from 'react';
import { Form, Input, Button, ButtonArea, TextArea, SuccessMessage,
         ErrorMessage } from '../form/Form.jsx';
import * as actions from '../../actions/actions.js';
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
        if (!currentUser || !currentUser.attributes || !currentUser.attributes.sub) {
            // TODO move me out of here
            return <h3>Please log in</h3>;
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
            <h2 className={ss.fetchingBots}>Fetching bots, please wait...</h2>;
        let botGridUi;
        if (botsState && botsState.bots) {
            const { bots } = botsState;
            // const rows = bots.map(x => [
            //     x.botName,
            //     `${window.location.origin}/webhooks/` +
            //         `${x.publisherId}/${x.botId}/`,
            // ]);
            botGridUi = (
                <div className={ss.botGrid}>
                    <div className={ss.headerRow}>
                        <div className={ss.nameHCell}>Name</div>
                        <div className={ss.typeHCell}>Type</div>
                        <div className={ss.webhookUrlsHCell}>Webhook URLs</div>
                    </div>
                    {
                        bots.map((x, i) => (
                            <div key={i} className={ss.contentRow}>
                                <div className={ss.nameCell}>
                                    { x.botName }
                                </div>
                                <div className={ss.typeCell}>
                                    Survey Bot
                                </div>
                                <div className={ss.webhookUrlsCell}>
                                    show
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
                    <h1>Profile</h1>
                    {
                        profileInfoUi
                    }
                </div>
                <div className={ss.botSection}>
                    <h1>Your Bots</h1>
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
    }
)(AccountPage);

AccountPage = withRouter(AccountPage);

export default AccountPage;
