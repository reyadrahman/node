/* @flow */

import React from 'react';
import _ from 'lodash';
import runTests from '../../client/tests/tests.js';

// $FlowFixMe
import 'mocha/mocha.css';

let DevTestsPage = React.createClass({
    shouldComponentUpdate() {
        return false;
    },

    componentDidMount() {
        runTests();
    },

    render() {
        const { className } = this.props;

        return (
            <div id="mocha" />
        );
    }
});



export default DevTestsPage;
