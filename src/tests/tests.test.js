/* @flow */

import '../server/preamble.js';
import 'babel-polyfill';

import { arity, callbackToPromise, catchPromise, timeout,
         destructureS3Url } from '../misc/utils.js';
import { ENV, CONSTANTS, request } from '../server/server-utils.js';
import * as aws from '../aws/aws.js';
import type { WebhookMessage, ResponseMessage, BotParams } from '../misc/types.js';
import * as deepiksBot from '../server/deepiks-bot/deepiks-bot.js';
import * as ais from '../server/deepiks-bot/ai.js';
import { assert } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import uuid from 'node-uuid';
import { Wit, log as witLog } from 'node-wit';
import { inspect } from 'util';
import URL from 'url';
import gm from 'gm';
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


const { DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS, DB_TABLE_BOTS, DB_TABLE_AI_ACTIONS,
        S3_BUCKET_NAME } = ENV;

// additional environment variables exclusive to testing
const { WIT_ACCESS_TOKEN } = process.env;

function createSampleWebhookMessage(): WebhookMessage {
    return {
        publisherId_conversationId: aws.composeKeys(
            uuid.v1().substr(0, 10) + ':' + uuid.v1().substr(10),
            uuid.v1()
        ),
        creationTimestamp: Date.now(),
        id: uuid.v1(),
        senderId: 'somesenderid',
        source: 'somesource',
        text: 'sometext',
        files: ['fileA', 'fileB'],
    };
}


describe('tests', function() {
    this.timeout(15000);

    before(catchPromise(async function (done) {
        this.timeout(60000);
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

    it('attachment middleware', catchPromise(async function(done) {
        const fileUrl = 'https://www.google.com.tr/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
        const message: WebhookMessage = {
            ...createSampleWebhookMessage(),
            text: 'hi',
            files: [fileUrl],
        };
        const res = await deepiksBot._attachmentMiddleware(message);
        assert(res);
        if (!res) return; // keep flow happy
        assert.equal(res.length, 1, `_attachmentMiddleware returned ${JSON.stringify(res)}`);
        assert(res[0].buffer instanceof Buffer,
            '_attachmentMiddleware did not return a buffer');
        assert.equal(res[0].format, 'png', 'failed to add the file extension');

        const reqRes = await request({
            url: URL.parse(fileUrl),
            encoding: null,
        })
        assert.equal(Buffer.compare(res[0].buffer, reqRes.body), 0, 'comparison to direct download failed');


        const bucketAndKey = destructureS3Url(await res[0].urlP);
        const s3Res = await aws.s3GetObject({
            Bucket: bucketAndKey.bucket,
            Key: bucketAndKey.key,
        });
        // const s3Res = await request({
        //     url: await res[0].urlP,
        //     encoding: null,
        // });

        console.log('res[0].buffer: ', res[0].buffer);
        console.log('s3Res.Body: ', s3Res.Body);
        assert.equal(Buffer.compare(res[0].buffer, s3Res.Body), 0, 'comparison to s3 object failed');

        done();
    }));

    it('ai responds to hello', catchPromise(async function(done) {
        const message: WebhookMessage = {
            ...createSampleWebhookMessage(),
            text: 'hello',
            files: ['fileA'],
        };
        await deepiksBot._updateConversationTable(message);

        const botParams = {
            publisherId: uuid.v1(),
            botId: uuid.v1(),
            settings: {
                witAccessToken: WIT_ACCESS_TOKEN,
            },
        };

        const responses = [];
        await ais.ai(deepiksBot._webhookMessageToDBMessage(message),
            (botParams: any),
            m => { responses.push(m); }
        );

        await timeout(5000);

        assert(responses.length && responses[0].text, `ai responses: ${JSON.stringify(responses)}`);
        done();
    }));

    it('routes hello message to ai (no attachments)', catchPromise(async function(done) {
        const message: WebhookMessage = {
            ...createSampleWebhookMessage(),
            text: 'hello',
            files: undefined
        };
        await deepiksBot._updateConversationTable(message);

        const botParams = {
            publisherId: uuid.v1(),
            botId: uuid.v1(),
            settings: {
                witAccessToken: WIT_ACCESS_TOKEN,
            },
        };


        const responses = [];
        await deepiksBot._route(message, (botParams: any), m => {
            responses.push(m);
        });

        await timeout(5000);

        assert(responses.length && responses[0].text, `ai responses: ${JSON.stringify(responses)}`);

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
        assert(res2.Items[0].publisherId_conversationId, message.publisherId_conversationId);
        assert(res2.Items[0].creationTimestamp, message.creationTimestamp+1);
        assert(res2.Items[0].text, responses[0].text);

        done();

    }));

    it('test ai action credentials', catchPromise(async function(done) {
        const message: WebhookMessage = {
            ...createSampleWebhookMessage(),
            text: 'test',
            files: undefined,
        };

        const botParams = {
            publisherId: uuid.v1(),
            botId: uuid.v1(),
            settings: {
                witAccessToken: WIT_ACCESS_TOKEN,
            },
        };

        const responses = [];
        await deepiksBot._route(message, (botParams: any), m => {
            responses.push(m);
        });

        console.log('responses: ', responses);
        done();
    }))

    it('can find a bot by id', catchPromise(async function(done) {
        const expected = {
            publisherId: uuid.v1(),
            botId: uuid.v1(),
            witSessionContext: {a:1, b:2},
        };

        await aws.dynamoPut({
            TableName: DB_TABLE_BOTS,
            Item: expected,
        });

        const bot = await aws.getBot(expected.publisherId, expected.botId);
        assert.deepEqual(bot, expected);
        done();
    }));

    it('can find an AI action', catchPromise(async function(done) {
        const expected = {
            action: uuid.v1(),
            lambda: uuid.v1(),
        };

        await aws.dynamoPut({
            TableName: DB_TABLE_AI_ACTIONS,
            Item: expected,
        });

        const temp = CONSTANTS.AI_ACTION_CACHE_VALID_TIME_S;
        CONSTANTS.AI_ACTION_CACHE_VALID_TIME_S = 0;
        let startTime = Date.now();
        const action1 = await aws.getAIAction(expected.action);
        assert.deepEqual(action1, expected);
        const dt1 = Date.now() - startTime;
        console.log('dt no cache: ', dt1);

        CONSTANTS.AI_ACTION_CACHE_VALID_TIME_S = temp;
        startTime = Date.now();
        const action2 = await aws.getAIAction(expected.action);
        assert.deepEqual(action2, expected);

        const dt2 = Date.now() - startTime;
        assert(dt2 < dt1/10,
            'The second call to aws.getAIAction was not cached'
        );
        console.log('dt cache: ', dt2);

        done();
    }));

    it('dynamoCleanUpObj', catchPromise(async function(done) {
        let x = {
            a:1,
            b:0,
            c: {},
            d: null,
            e: {
                f: '',
                g: 'a',
                h: [],
                i: undefined,
                j: [1, null, '', undefined],
            },
        };

        assert.deepEqual(aws.dynamoCleanUpObj(x), {
            a:1,
            b:0,
            c: {},
            e: {
                g: 'a',
                h: [],
                j: [1, null, '', undefined],
            },
        });
        done();

    }));

    // it('graphicsmagick', catchPromise(async function(done) {
        // const uri = 'https://s3.amazonaws.com/deepiksbotdev/somePublisherA/B1S3AJG77%3AT1S1LLNCT%3AC1S32B39S/211d18021ed045a7908741bf088705d0_0';
        //
        // const { body } = await request({
        //     uri,
        //     encoding: null,
        // });
        // const body = Buffer.from([0x01,0x02,0x03,0x04,0x05,0x06]);
        // const gmImg = gm(body);
        // const formatFn = callbackToPromise(gmImg.format, gmImg);
        // const format = await formatFn();
        // console.log('format: ', format);
        //
        //
        // done();

    // }));

    // it('wit.ai', catchPromise(async function(done) {
    //
    //     const client = new Wit({
    //         accessToken: WIT_ACCESS_TOKEN,
    //         actions: {
    //             send: catchPromise(async function(request, response) {
    //                 console.log('actions.send: ', response);
    //             }),
    //             merge: catchPromise(async function({entities, context, message, sessionId}) {
    //                 console.log('actions.merge...');
    //                 console.log('entities: ', entities);
    //                 console.log('context: ', context);
    //                 console.log('message: ', message);
    //                 console.log('sessionId: ', sessionId);
    //                 return context;
    //             }),
    //             dummy: catchPromise(async function({sessionId, context, text, entities}) {
    //                 console.error('**** DUMMY ****');
    //                 console.log('actions.myfunb...');
    //                 console.log(`Session ${sessionId} received ${text}`);
    //                 console.log(`The current context is: `, context);
    //                 console.log(`Wit extracted: `, entities);
    //             }),
    //             findSimilarImages: catchPromise(async function(actionParams) {
    //                 console.log('**** actions.findSimilarImages ****');
    //                 console.log('action params: ', inspect(actionParams, {depth: 5}));
    //                 return {};
    //             }),
    //             getForecast: catchPromise(async function({sessionId, context, entities}) {
    //                 console.error('**** getForecast ****');
    //                 if (!ais._firstEntityValue(entities, 'location')){
    //                     return { missingLocation: true };
    //                 } else {
    //                     return { forecast: 'rainy as always' };
    //                 }
    //             }),
    //         },
    //         logger: new witLog.Logger(witLog.DEBUG)
    //     });
    //
    //     // const context = {
    //     //     imageAttachment: 'myAttachment...',
    //     // };
    //     let context = {
    //         gotAttachments: true,
    //         allAttachments: [1,2,3],
    //     };
    //
    //     console.log('=============================');
    //     const sessionId = uuid.v1();
    //     // let converseData = await client.runActions(sessionId, 'what the weather', context);
    //     let converseData = await client.converse(sessionId, 'what the weather', context);
    //
    //     for (let i=0; i<5; i++) {
    //         console.log('converse returned data: \n', inspect(converseData, {depth: 5}));
    //
    //         if (!converseData.type || converseData.type === 'error') {
    //             // TODO
    //             return;
    //         }
    //
    //         if (converseData.type === 'merge') {
    //             converseData.type = 'action';
    //             converseData.action = 'merge';
    //         }
    //
    //
    //         if (converseData.type === 'stop') {
    //             console.log('!!! stop');
    //             break;
    //
    //         } else if (converseData.type === 'msg') {
    //             console.log('!!! msg');
    //
    //             context = _.omit(context, 'gotAttachments');
    //             converseData = await client.converse(sessionId, null, context);
    //
    //         } else if (converseData.type === 'action') {
    //             console.log('!!! action: ', converseData.action);
    //             const request = {
    //                 sessionId,
    //                 context: _.cloneDeep(context),
    //                 // text: message,
    //                 entities: converseData.entities,
    //             };
    //
    //             context = await client.config.actions[converseData.action](request);
    //             converseData = await client.converse(sessionId, null, context);
    //
    //         }
    //
    //         console.log('-----------------------------');
    //     }
    //
    //
    //     // context = {};
    //     converseData = await client.converse(sessionId, 'what is weather', context);
    //     for (let i=0; i<5; i++) {
    //         console.log('converse returned data: \n', inspect(converseData, {depth: 5}));
    //
    //         if (!converseData.type || converseData.type === 'error') {
    //             // TODO
    //             return;
    //         }
    //
    //         if (converseData.type === 'merge') {
    //             converseData.type = 'action';
    //             converseData.action = 'merge';
    //         }
    //
    //
    //         if (converseData.type === 'stop') {
    //             console.log('!!! stop');
    //             break;
    //
    //         } else if (converseData.type === 'msg') {
    //             console.log('!!! msg');
    //
    //             const newContext = _.omit(context, 'gotAttachments');
    //             converseData = await client.converse(sessionId, null, newContext);
    //
    //         } else if (converseData.type === 'action') {
    //             console.log('!!! action: ', converseData.action);
    //             const request = {
    //                 sessionId,
    //                 context: _.cloneDeep(context),
    //                 // text: message,
    //                 entities: converseData.entities,
    //             };
    //
    //             context = await client.config.actions[converseData.action](request);
    //             converseData = await client.converse(sessionId, null, context);
    //
    //         }
    //
    //         console.log('-----------------------------');
    //     }
    //
    //
    //     assert.equal(1,1);
    //     done();
    // }));

});
