import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';
import App from './components/app/App.jsx';
import SignedInPage from './components/signed-in-page/SignedInPage.jsx';
import Home from './components/home/Home.jsx';
import SearchPage from './components/search-page/SearchPage.jsx';
import ContactsPage from './components/contacts-page/ContactsPage.jsx';
import AccountPage from './components/account-page/AccountPage.jsx';
import MessagesPage from './components/messages-page/MessagesPage.jsx';
import AddBotPage from './components/add-bot-page/AddBotPage.jsx';
import NotificationsPage from './components/notifications-page/NotificationsPage.jsx';
import TermsOfUse from './components/termsOfUse/TermsOfUse.jsx'
import Privacy from './components/privacy/Privacy.jsx'

const Routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/terms" component={TermsOfUse} />
        <Route path="/privacy" component={Privacy} />
        <Route component={SignedInPage}>
            <Route path="/account" component={AccountPage} />
            <Route path="/messages(/:conversationId)" component={MessagesPage} />
            <Route path="/add-bot" component={AddBotPage} />
            <Route path="/notifications" component={NotificationsPage} />
        </Route>
    </Route>
);


export default Routes;
