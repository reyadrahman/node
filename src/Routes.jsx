import React from 'react'
import {Route, Redirect, IndexRoute} from 'react-router'
import App from './components/app/App.jsx';
import Home from './components/home/Home.jsx';

const PassThrough = React.createClass({
    render() {
        <div>
            {this.props.children}
        </div>
    }
});

const Routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Home}/>
        <Route path="a" component={Home}>
        </Route>
        <Route path="b" component={Home}>
        </Route>
    </Route>
);


export default Routes;
