import React from 'react'
import {Route, Redirect, IndexRoute} from 'react-router'
import App from './components/app/App.jsx';
import Home from './components/home/Home.jsx';

import {languages} from './i18n/translations.js';

const PassThrough = React.createClass({
    render() {
        <div>
            {this.props.children}
        </div>
    }
});

const Routes = [
    <IndexRoute component={Home}/>,
    <Route path="a" component={Home}>
    </Route>,
    <Route path="b" component={Home}>
    </Route>,
];

const RoutesWithLang = (
    <Route path="/" component={App}>
        {
            languages.map(lang => (
                <Route path={lang}>
                    {Routes}
                </Route>
            ))
        }
        {Routes}
    </Route>
);

/*
const RoutesWithLang = (
    <Route path="/" component={App}>
        <Route path="abc" component={Home}/>
        { [
        <Route path="bbb" component={Home}/>,
        <Route path="ccc" component={Home}/>
            ]
        }
    </Route>
);
*/


export default RoutesWithLang;
