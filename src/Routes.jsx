import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';
import App from './components/app/App.jsx';
import SignedInPage from './components/signed-in-page/SignedInPage.jsx';
import Home from './components/home/Home.jsx';
import AccountPage from './components/account-page/AccountPage.jsx';
import BotSettingsPage from './components/bot-setting-page/BotSettingsPage.jsx';
import UsersPage from './components/users/UsersPage.jsx';
import UserSavePage from './components/users/UserSavePage.jsx';
import MessagesPage from './components/messages-page/MessagesPage.jsx';
import AddBotPage from './components/add-bot-page/AddBotPage.jsx';
import FeedsPage from './components/feeds-page/FeedsPage.jsx';
import PollsPage from './components/polls-page/PollsPage.jsx';
import TestPage from './components/test-page/TestPage.jsx';
import NotificationsPage from './components/notifications-page/NotificationsPage.jsx';
import TermsOfUsePage from './components/terms-of-use-page/TermsOfUsePage.jsx'
import PrivacyPage from './components/privacy-page/PrivacyPage.jsx'

const Routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="/terms" component={TermsOfUsePage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route component={SignedInPage}>
            <Route path="/account" component={AccountPage} />
            <Route path="/settings" component={BotSettingsPage}/>
            <Route path="/users" component={UsersPage} />
            <Route path="/users/add" component={UserSavePage}/>
            <Route path="/users/edit/:botId_userId" component={UserSavePage}/>
            <Route path="/messages(/:selectedBotId)(/:conversationId)" component={MessagesPage} />
            <Route path="/feeds" component={FeedsPage} />
            <Route path="/polls" component={PollsPage}/>
            <Route path="/add-bot" component={AddBotPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/test" component={TestPage} />
        </Route>
    </Route>
);


export default Routes;
