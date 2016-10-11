/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';
import {simpleTimeFormat, decomposeKeys} from '../../misc/utils.js';

import {Pagination, Alert} from 'react-bootstrap';

let UsersPage = React.createClass({
    getInitialState() {
        return {
            page:         1,
            perPage:      20,
            searchFilter: ''
        };
    },

    onFilterChange(e){
        this.setState({searchFilter: e.target.value.toLowerCase()});
    },

    paginate(page) {
        this.setState({page});
    },

    componentDidMount() {
        const {currentUser, fetchUsers} = this.props;
        if (!currentUser.signedIn) {
            return;
        }

        if (currentUser.selectedBotId) {
            fetchUsers(currentUser.selectedBotId);
        }
    },

    componentDidUpdate(oldProps) {
        const {currentUser, fetchUsers} = this.props;
        if (!currentUser.signedIn) {
            return;
        }

        if (currentUser.selectedBotId &&
            currentUser.selectedBotId != oldProps.currentUser.selectedBotId)
        {
            fetchUsers(currentUser.selectedBotId);
        }
    },

    render() {
        const {className, currentUser} = this.props;

        if (!currentUser.signedIn) {
            return null;
        }

        let content;

        let pagination = '';

        if (!currentUser.usersState.hasFetched) {
            if (currentUser.usersState.errorMessage) {
                content = (
                    <tr>
                        <td colSpan="6" className="text-center">
                            <Alert bsStyle="danger">{currentUser.usersState.errorMessage}</Alert>
                        </td>
                    </tr>
                );
            } else {
                content = (
                    <tr>
                        <td colSpan="6" className="text-center spinner"><i className="icon-spinner animate-spin"/></td>
                    </tr>
                );
            }
        } else {
            let pageUsers, users;

            users = currentUser.usersState.users;

            if (this.state.searchFilter) {
                users = users.filter(user => {
                    let userId    = decomposeKeys(user.botId_channel_userId)[2];
                    let userEmail = user.botId_channel_email && decomposeKeys(user.botId_channel_email)[2] || '';
                    return userId.toLowerCase().indexOf(this.state.searchFilter) > -1 ||
                        userEmail.toLowerCase().indexOf(this.state.searchFilter) > -1;
                });
            }

            if (users.length > this.state.perPage) {
                pageUsers = users.slice((this.state.page - 1) * this.state.perPage, this.state.page * this.state.perPage);

                pagination = (
                    <Pagination
                        activePage={this.state.page}
                        items={Math.ceil(users.length / this.state.perPage)}
                        onSelect={this.paginate}
                    />
                );

            } else {
                pageUsers = users;
            }

            if (users.length) {
                content = pageUsers.map(function (user) {
                    let [botId, channel, userId] = user.botId_channel_userId.split('__');
                    let email = user.botId_channel_email && decomposeKeys(user.botId_channel_email)[2] || '';

                    let lastConversationId, text;

                    if (user.userLastMessage) {
                        lastConversationId = decomposeKeys(user.userLastMessage.publisherId_conversationId)[1];
                        text               = user.userLastMessage.text || '';
                        if (text.length > 20) {
                            text = text.substr(0, 17) + '...';
                        }
                    }

                    return (
                        <tr>
                            <td className="user-id">{userId}</td>
                            <td>{email}</td>
                            <td>{channel}</td>
                            <td>{user.userRole || 'user'}</td>
                            <td>
                                {lastConversationId
                                    ?
                                    <Link to={`/messages/${currentUser.selectedBotId}/${lastConversationId}`}>
                                        [{ simpleTimeFormat(user.userLastMessage.creationTimestamp) }]
                                    &nbsp;<b>{user.userLastMessage.senderName}:</b>&nbsp;
                                        {text}
                                    </Link>
                                    : '-'}
                            </td>
                            <td className="actions">
                                <Link to={`/users/edit/${user.botId_channel_userId}`}>
                                    <i className="icon-edit"/>
                                </Link>
                            </td>
                        </tr>
                    )
                });
            } else {
                content = (
                    <tr>
                        <td colSpan="6" className="text-center">No users were found for this bot</td>
                    </tr>
                );
            }
        }

        return (
            <div className={`users-page-comp ${className}`}>
                <div className="panel">
                    <div className="panel-heading">
                        <h1>Users</h1>
                        <div className="input-group col-xs-4">
                            <input type="text" name="filter"
                                   className="form-control" value={ this.state.searchFilter }
                                   onChange={this.onFilterChange}
                                   placeholder="Search..."/>
                            <div className="input-group-addon"><i className="icon-search"/></div>
                        </div>
                    </div>

                    <div className="panel-body">
                        <table className="table table-bordered table-hover table-striped">
                            <thead>
                            <tr>
                                <th>User ID</th>
                                <th>E-Mail</th>
                                <th>Channel</th>
                                <th>Role</th>
                                <th>Last Message</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {content}
                            </tbody>
                        </table>

                        {pagination}
                    </div>

                    <div className="panel-footer text-right">
                        <Link to="/users/add" className="btn btn-primary">Add User</Link>
                    </div>
                </div>
            </div>
        );
    }
});

UsersPage = connect(
    state => ({
        currentUser: state.currentUser,
    }),
    {
        selectBot:  actions.selectBot,
        fetchUsers: actions.fetchUsers,
    }
)(UsersPage);

UsersPage = withRouter(UsersPage);


export default UsersPage;
