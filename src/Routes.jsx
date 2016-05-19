import React from 'react';
import { Route, Redirect, IndexRoute } from 'react-router';
import App from './components/app/App.jsx';
import Home from './components/home/Home.jsx';
import SearchPage from './components/search-page/SearchPage.jsx';
import ContactsPage from './components/contacts-page/ContactsPage.jsx';

const Routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Home} />
        <Route path="search" component={SearchPage} />
        <Route path="search/*" component={SearchPage} />
        <Route path="contacts" component={ContactsPage} />
    </Route>
);


export default Routes;
