/* @flow */

import '../preamble.js';
import 'babel-polyfill';

import { callbackToPromise, catchPromise, ENV, timeout, request } from '../lib/util.js';
import * as aws from '../lib/aws.js';
import { assert } from 'chai';
import _ from 'lodash';
import { inspect } from 'util';
import URL from 'url';
import gm from 'gm';

declare function describe(name: string, f: Function): void;
declare function it(name: string, f: Function): void;
declare function before(f: Function): void;
declare function beforeEach(f: Function): void;
declare function afterEach(f: Function): void;


const { DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS, DB_TABLE_BOTS, S3_BUCKET_NAME } = ENV;

describe('tests', function() {
    this.timeout(15000);

    it('', catchPromise(async function(done) {
        done();
    }));
});
