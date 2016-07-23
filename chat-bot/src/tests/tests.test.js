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


const { DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS, DB_TABLE_BOTS, S3_BUCKET_NAME } = ENV;

function createSampleWebhookMessage(): WebhookMessage {
    return {
        publisherId_conversationId: aws.composeKeys(uuid.v1(), uuid.v1()),
        creationTimestamp: Date.now(),
        id: uuid.v1(),
        senderId: 'somesenderid',
        source: 'somesource',
        text: 'sometext',
        files: ['fileA', 'fileB'],
    };
}


describe('tests', function() {
    this.timeout(60000);

    before(catchPromise(async function (done) {
        await aws.initResources(1, 1);
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
            TableName: DB_TABLE_MESSAGES,
            // IndexName: 'Index',
            KeyConditionExpression: 'publisherId_conversationId = :pc and creationTimestamp = :t',
            ExpressionAttributeValues: {
                ':pc': message.publisherId_conversationId,
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
    it('updates conversation table', catchPromise(async function(done) {
        const message: WebhookMessage = createSampleWebhookMessage();
        const witSession = {a: 1, b: 2};

        const [publisherId, conversationId] = aws.decomposeKeys(message.publisherId_conversationId);

        await deepiksBot._updateConversationTable(message);
        await aws.dynamoPut({
            TableName: DB_TABLE_CONVERSATIONS,
            Item: {
                publisherId,
                conversationId,
                witSession,
            },
        });

        // must not overwrite
        await deepiksBot._updateConversationTable(message);

        const qres = await aws.dynamoQuery({
            TableName: DB_TABLE_CONVERSATIONS,
            KeyConditionExpression: 'publisherId = :publisherId and conversationId = :conversationId',
            ExpressionAttributeValues: {
                ':publisherId': publisherId,
                ':conversationId': conversationId,
            },
        });
        assert.equal(qres.Count, 1);
        assert.deepEqual(qres.Items[0].witSession, witSession);
        done();

    }));

    it('routes to ai', catchPromise(async function(done) {
        const message: WebhookMessage = {
            ...createSampleWebhookMessage(),
            text: 'hi',
        };
        const responses = [];
        const respondFn = m => {
            responses.push(m);
        };
        await deepiksBot._route(message, respondFn);

        await timeout(5000);

        assert.deepEqual(responses, ['Hi there']);

        const res1 = await deepiksBot._isMessageInDB(message);
        assert.equal(res1, true);

        const res2 = await aws.dynamoQuery({
            TableName: DB_TABLE_MESSAGES,
            // IndexName: 'Index',
            KeyConditionExpression: 'publisherId_conversationId = :pc and creationTimestamp = :t',
            ExpressionAttributeValues: {
                ':pc': message.publisherId_conversationId,
                ':t': message.creationTimestamp+1,
            },
        });

        assert.equal(res2.Count, 1);
        assert.deepEqual(res2.Items[0], {
            publisherId_conversationId: message.publisherId_conversationId,
            creationTimestamp: message.creationTimestamp+1, // must be unique
            text: 'Hi there',
        });

        done();

    }));

    it('can find a bot by id', catchPromise(async function(done) {
        const expected = {
            publisherId: uuid.v1(),
            botId: uuid.v1(),
            witSessionContext: {a:1, b:2},
        }

        await aws.dynamoPut({
            TableName: DB_TABLE_BOTS,
            Item: expected,
        });

        const bot = await aws.getBotById(expected.botId);
        assert.deepEqual(bot, expected);
        done();
    }));


});
