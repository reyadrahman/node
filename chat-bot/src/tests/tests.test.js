/* @flow */

import '../preamble.js';
import 'babel-polyfill';

import { arity, catchPromise, ENV, timeout } from '../lib/util.js';
import * as aws from '../lib/aws.js';
import type { WebhookMessage, ResponseMessage } from '../lib/types.js';
import * as deepiksBot from '../deepiks-bot/deepiks-bot.js';
import { assert } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import uuid from 'node-uuid';
// import util from 'util';
// import http from 'http';
// import https from 'https';
// import { PassThrough } from 'stream';
// const gm = require('gm').subClass({imageMagick: true});
// import fs from 'fs';

declare function describe(name: string, f: Function): void;
declare function it(name: string, f: Function): void;
declare function before(f: Function): void;
declare function beforeEach(f: Function): void;
declare function afterEach(f: Function): void;


const { DB_TABLE_CONVERSATIONS, DB_TABLE_BOTS, S3_BUCKET_NAME } = ENV;

function createSampleWebhookMessage(): WebhookMessage {
    return {
        conversationId: uuid.v1(),
        creationTimestamp: Date.now(),
        id: 'someid',
        senderId: 'somesenderid',
        source: 'somesource',
        text: 'sometext',
        files: ['fileA', 'fileB'],
    };
}


describe('tests', function() {
    this.timeout(15000);

    before(catchPromise(async function (done) {
        await aws.initResources();
        done();
    }));

    beforeEach(() => {

    });

    afterEach(() => {
    })

    it('saves message to db', catchPromise(async function(done) {
        const message = createSampleWebhookMessage();
        await deepiksBot._logWebhookMessage(message);

        const qres = await aws.dynamoQuery({
            TableName: DB_TABLE_CONVERSATIONS,
            // IndexName: 'Index',
            KeyConditionExpression: 'conversationId = :conversationId and creationTimestamp = :t',
            ExpressionAttributeValues: {
                ':conversationId': message.conversationId,
                ':t': message.creationTimestamp,
            },
        });

        assert.equal(qres.Count, 1);
        assert.deepEqual(qres.Items[0], message);
        done();
    }));

    it('tests if message is in db', catchPromise(async function(done) {
        const message = createSampleWebhookMessage();
        await deepiksBot._logWebhookMessage(message);

        const res = await deepiksBot._isMessageInDB(message);
        assert.equal(res, true);
        done();
    }));

    it('uploads to S3', catchPromise(async function(done) {
        const buf = Buffer.from([0x01,0x02,0x03,0x04,0x05,0x06]);

        const key = uuid.v1();
        await deepiksBot._uploadToS3(key, buf);
        const res = await aws.s3GetObject({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });

        assert.equal(Buffer.compare(buf, res.Body), 0);
        done();
    }));
    it('routes to ai', catchPromise(async function(done) {
        const message = {
            ...createSampleWebhookMessage(),
            text: 'hi',
        };
        const responses = [];
        const respondFn = m => {
            responses.push(m);
        };
        await deepiksBot._aiRoute(message, respondFn, {});

        await timeout(5000);

        assert.deepEqual(responses, ['Hi there']);
        done();

        const res1 = await deepiksBot._isMessageInDB(message);
        assert.equal(res1, true);

        const res2 = await aws.dynamoQuery({
            TableName: DB_TABLE_CONVERSATIONS,
            // IndexName: 'Index',
            KeyConditionExpression: 'conversationId = :conversationId and creationTimestamp = :t',
            ExpressionAttributeValues: {
                ':conversationId': message.conversationId,
                ':t': message.creationTimestamp+1,
            },
        });

        assert.equal(res2.Count, 1);
        assert.deepEqual(res2.Items[0], {
            conversationId: message.conversationId,
            creationTimestamp: message.creationTimestamp+1, // must be unique
            text: 'Hi there',
        });

    }));

});
