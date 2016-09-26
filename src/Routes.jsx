import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';
import App from './components/app/App.jsx';
import SignedInPage from './components/signed-in-page/SignedInPage.jsx';
import Home from './components/home/Home.jsx';
import AccountPage from './components/account-page/AccountPage.jsx';
import MessagesPage from './components/messages-page/MessagesPage.jsx';
import AddBotPage from './components/add-bot-page/AddBotPage.jsx';
import FeedsPage from './components/feeds-page/FeedsPage.jsx';
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
            <Route path="/messages(/:selectedBotId)(/:conversationId)" component={MessagesPage} />
            <Route path="/feeds" component={FeedsPage} />
            <Route path="/add-bot" component={AddBotPage} />
            <Route path="/notifications" component={NotificationsPage} />
        </Route>
    </Route>
);


export default Routes;
