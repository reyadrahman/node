/* @flow */

const reportDebug = require('debug')('deepiks:tests');

// $FlowFixMe
import 'script!mocha/mocha.js';
let describe, it, before, beforeEach, after, afterEach;

import expect from 'must';

export default function runTests() {
    reportDebug('***** tests *****');
    mocha.setup('bdd');
    ({ describe, it, before, beforeEach, after, afterEach } = window);
    describeTests();
    mocha.run();
}


function describeTests() {
    describe('abc', function() {
        it('xxx', function() {

        });

        it('yyy', function() {
            expect('x').to.be('y');
        });

        it('zzzxzzz', async function() {
            throw new Error('failing test');
        });
    });

}


