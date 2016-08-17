import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';
import App from './components/app/App.jsx';
import Home from './components/home/Home.jsx';
import SearchPage from './components/search-page/SearchPage.jsx';
import ContactsPage from './components/contacts-page/ContactsPage.jsx';
import BotsPage from './components/bots-page/BotsPage.jsx';
import MessagesPage from './components/messages-page/MessagesPage.jsx';
import AddBotPage from './components/add-bot-page/AddBotPage.jsx';

const Routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="messages(/:conversationId)" component={MessagesPage} />
        <Route path="bots" component={BotsPage} />
        <Route path="add-bot" component={AddBotPage} />
        <Route path="contacts" component={ContactsPage} />
    </Route>
);


export default Routes;
