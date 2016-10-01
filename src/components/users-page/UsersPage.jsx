/* @flow */

import React from 'react';
import * as actions from '../../app-state/actions.js';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router';

let UsersPage = React.createClass({
    getInitialState() {
        return {};
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
        const {params, currentUser, fetchUsers} = this.props;
        if (!currentUser.signedIn) {
            return;
        }

        if (currentUser.selectedBotId != oldProps.currentUser.selectedBotId) {
            fetchUsers(currentUser.selectedBotId);
        }
    },

    render() {
        const {
                  className, params, currentUser, i18n,
                  i18n: {strings: {UsersPage: strings}}
              } = this.props;

        if (!currentUser.signedIn) {
            return null;
        }

        let content;

        if (!currentUser.usersState.hasFetched) {
            if (currentUser.usersState.errorMessage) {
                content = (
                    <tr>
                        <td colSpan="5" className="text-center">{currentUser.usersState.errorMessage}</td>
                    </tr>
                );
            } else {
                content = (
                    <tr>
                        <td colSpan="5" className="text-center spinner"><i className="icon-spinner animate-spin"/></td>
                    </tr>
                );
            }
        } else {
            content = currentUser.usersState.users.map(function (user) {
                let userId = user.botId_userId.split('__')[1];

                return (
                    <tr>
                        <td className="user-id">{userId}</td>
                        <td>-</td>
                        <td>{user.role || 'User'}</td>
                        <td>-</td>
                        <td className="actions">
                            <a href={`/users/edit/${userId}`}>
                                <i className="icon-edit"/>
                            </a>
                        </td>
                    </tr>
                )
            });
        }

        return (
            <div className={`users-page-comp ${className}`}>
                <div className="panel">
                    <div className="panel-heading">
                        <h1>Users</h1>
                    </div>

                    <div className="panel-body">
                        <table className="table table-bordered table-hover table-striped">
                            <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Channel</th>
                                <th>Role</th>
                                <th>Last Chat</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {content}
                            </tbody>
                        </table>
                    </div>

                    <div className="panel-footer text-right">
                        <a href="/users/add" className="btn btn-primary">Add User</a>
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
