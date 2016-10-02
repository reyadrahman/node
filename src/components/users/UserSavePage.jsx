/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import {
    Button, FormGroup, ControlLabel, FormControl
} from 'react-bootstrap';

let UserSavePage = React.createClass({
    getInitialState() {
        return {
            user: {
                id:       '',
                channel:  '',
                category: ''
            }
        };
    },

    onFormFieldChange(e) {
        console.log('event: ', e.target.id, e.target.value);
        let user          = this.state.user;
        user[e.target.id] = e.target.value;
        this.setState({user});
    },

    async save(e) {
        e.preventDefault();
        let user   = this.state.user;
        user.botId = this.props.currentUser.selectedBotId;
        let saved  = await (await this.props.saveUser(this.props.params.botId_userId, user)).json();

        if (!this.props.params.botId_userId) {
            this.props.router.push(`/users/edit/${saved.botId_userId}`);
        }
    },

    async fetchUser() {
        const {currentUser, params, fetchUser} = this.props;


        if (currentUser.selectedBotId && params.botId_userId) {
            this.setState({fetchingUser: true});

            let parts = params.botId_userId.split('__');
            this.setState({botId: parts[0], userId: parts[1]});

            if (parts[0] !== currentUser.selectedBotId) {
                this.props.selectBot(parts[0]);
            }

            let user      = await fetchUser(parts[0], parts[1]);
            user.id       = user.botId_userId.split('__')[1];
            user.category = user.category || '';
            user.channel  = user.channel || '';
            this.setState({user: user, fetchingUser: false});
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

        if (params.botId_userId != oldProps.params.botId_userId) {
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

        if (this.state.fetchingUser || (!this.state.user.id && params.botId_userId)) {
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
                            disabled={!!params.botId_userId}
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
                            onChange={this.onFormFieldChange}
                        />
                    </FormGroup>
                    <FormGroup
                        controlId="category"
                    >
                        <ControlLabel>Role</ControlLabel>
                        <FormControl
                            componentClass="select"
                            value={user.category}
                            placeholder="Role"
                            onChange={this.onFormFieldChange}
                        >
                            <option value="admin">Admin</option>
                            <option value="">User</option>
                            <option value="none">None</option>
                        </FormControl>
                    </FormGroup>
                </form>
            );
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

                    <div className="panel-footer text-right">
                        <Button onClick={this.save} bsStyle="primary" disabled={!user.id}>
                            Save User
                        </Button>
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
