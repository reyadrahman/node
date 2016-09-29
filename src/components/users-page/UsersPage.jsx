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

        return (
            <div className="users-page-comp">
                Users table here
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
