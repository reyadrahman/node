/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import {
    Button, FormGroup, ControlLabel, FormControl, Alert
} from 'react-bootstrap';

let UserSavePage = React.createClass({
    getInitialState() {
        return {
            user:  {
                id:       '',
                channel:  '',
                userRole: 'user'
            },
            saved: false,
            busy:  false,
            error: null
        };
    },

    onFormFieldChange(e) {
        let user          = this.state.user;
        user[e.target.id] = e.target.value;
        this.setState({user});
    },

    async save(e) {
        e.preventDefault();

        this.setState({busy: true, error: null});

        let user   = this.state.user;
        user.botId = this.props.currentUser.selectedBotId;
        try {
            let saved = await this.props.saveUser(this.props.params.botId_channel_userId, user);
            this.setState({saved: true});

            setTimeout(() => {this.setState({saved: null})}, 2000);

            if (!this.props.params.botId_channel_userId) {
                this.props.router.push(`/users/edit/${saved.botId_channel_userId}`);
            }
        }
        catch (e) {
            this.setState({error: e.message})
        } finally {
            this.setState({busy: false});
        }
    },

    async fetchUser() {
        const {currentUser, params, fetchUser} = this.props;


        if (currentUser.selectedBotId && params.botId_channel_userId) {
            this.setState({fetchingUser: true, error: null});

            let [botId, channel, userId] = params.botId_channel_userId.split('__');
            this.setState({botId, channel, userId});

            if (botId !== currentUser.selectedBotId) {
                this.props.selectBot(botId);
            }

            try {
                let user      = await fetchUser(botId, channel, userId);
                user.id       = userId;
                user.userRole = user.userRole || 'user';
                user.channel  = channel;

                this.setState({user: user});
            } catch (e) {
                this.setState({error: e.message})
            } finally {
                this.setState({fetchingUser: false});
            }
        }
    },

    componentDidMount() {
        if (!this.props.currentUser.signedIn) {
            return;
        }

        this.fetchUser();
    },

    componentDidUpdate(oldProps) {
        const {params, currentUser} = this.props;
        if (!currentUser.signedIn) {
            return;
        }

        if (currentUser.selectedBotId != oldProps.currentUser.selectedBotId) {
            if (oldProps.currentUser.selectedBotId) {
                this.props.router.push('/users');
            } else {
                this.fetchUser();
            }

            return;
        }

        if (oldProps.params.botId_channel_userId && params.botId_channel_userId != oldProps.params.botId_channel_userId) {
            this.fetchUser();
        }
    },

    render() {
        const {className, params, currentUser} = this.props;

        if (!currentUser.signedIn) {
            return null;
        }

        let user = this.state.user;
        let content;

        if (this.state.fetchingUser || (!this.state.user.id && params.botId_channel_userId)) {
            content = <i className="icon-spinner animate-spin"/>;
        } else {
            content = (
                <form className="send-notifications-form">
                    <FormGroup
                        controlId="id"
                    >
                        <ControlLabel>User ID</ControlLabel>
                        <FormControl
                            type="text"
                            value={user.id}
                            placeholder="User ID"
                            disabled={!!params.botId_channel_userId}
                            onChange={this.onFormFieldChange}
                        />
                    </FormGroup>
                    <FormGroup
                        controlId="channel"
                    >
                        <ControlLabel>Channel</ControlLabel>
                        <FormControl
                            type="text"
                            value={user.channel}
                            placeholder="Channel"
                            disabled={!!params.botId_channel_userId}
                            onChange={this.onFormFieldChange}
                        />
                    </FormGroup>
                    <FormGroup
                        controlId="userRole"
                    >
                        <ControlLabel>Role</ControlLabel>
                        <FormControl
                            componentClass="select"
                            value={user.userRole}
                            placeholder="Role"
                            onChange={this.onFormFieldChange}
                        >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="none">None</option>
                        </FormControl>
                    </FormGroup>
                </form>
            );

            if (this.state.error) {
                content += <Alert bsStyle="danger">{this.state.error}</Alert>;
            }
        }

        let alert = '';

        if (this.state.saved) {
            alert = <Alert bsStyle="success">User saved</Alert>;
        }

        return (
            <div className={`users-page-comp ${className}`}>
                <div className="panel">
                    <div className="panel-heading">
                        <h1>User {user.id}</h1>
                    </div>

                    <div className="panel-body">
                        {content}
                    </div>

                    <div className="panel-footer">
                        <div className="row">
                            <div className="col-xs-4"/>
                            <div className="col-xs-4 submit-alert">
                                {alert}
                            </div>
                            <div className="col-xs-4 text-right">
                                <Button onClick={this.save} bsStyle="primary" disabled={!user.id || this.state.busy}>
                                    Save User
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

UserSavePage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        selectBot: actions.selectBot,
        fetchUser: actions.fetchUser,
        saveUser:  actions.saveUser,
    }
)(UserSavePage);

UserSavePage = withRouter(UserSavePage);


export default UserSavePage;
