/* @flow */

import '../preamble.js';
import 'babel-polyfill';

import { callbackToPromise, timeout, destructureS3Url, composeKeys,
         decomposeKeys, toStr } from '../../misc/utils.js';
import type { DBMessage, WebhookMessage, ResponseMessage, BotParams } from '../../misc/types.js';
import { CONSTANTS, request } from '../server-utils.js';
import * as serverUtils from '../server-utils.js';
import * as aws from '../../aws/aws.js';
import * as deepiksBot from '../deepiks-bot/deepiks-bot.js';
import * as witAI from '../deepiks-bot/ai/wit-ai.js';
import * as ce from '../deepiks-bot/conversational-engine/conversational-engine.js';
import { translations, languages } from '../i18n/translations.js';
import * as messenger from '../channels/messenger.js';
import * as spark from '../channels/spark.js';
import testStories from './test-story.json';
import expect from 'must';
import _ from 'lodash';
import sinon from 'sinon';
import uuid from 'node-uuid';
import sparkClient from 'ciscospark';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import ice from 'icepick';
import JSZip from 'jszip';

const reportDebug = require('debug')('deepiks:tests');
const reportError = require('debug')('deepiks:tests:error');

// this allows writing to _aws_ using sinon
const _aws_ = require('../../aws/aws-helper.js');

declare function describe(name: string, f: Function): void;
declare function it(name: string, f: Function): void;
declare function before(f: Function): void;
declare function after(f: Function): void;
declare function beforeEach(f: Function): void;
declare function afterEach(f: Function): void;

// This is the wit.ai test app managed by sean shirazi
const WIT_ACCESS_TOKEN = '5ZPNBXEMORNVRRYYHW5ABO7X3YAHBHBW';



function createSampleDBMessage(publisherId, conversationId, suffix = uuid.v4(), i = 0): DBMessage {
    return {
        publisherId_conversationId: composeKeys(
            publisherId, conversationId
        ),
        creationTimestamp: Date.now() + i,
        senderIsBot: false,
        id: uuid.v4(),
        senderName: 'sendername' + suffix,
        senderId: 'somesenderid' + suffix,
        channel: 'somechan',
        text: 'sometext' + suffix,
        senderProfilePic: 'senderprofilepicurl' + suffix,
        cards: [
            {
                imageUrl: 'imageurl',
                title: 'title',
                subtitle: 'subtitle',
                actions: [
                    {
                        text: 'actiontext',
                        postback: 'actionpostback',
                        fallback: 'actionfallback',
                    }
                ]
            }
        ],
    };
}

const sampleResponseMessage1 = {
    creationTimestamp: 1,
    text: 'abc',
    cards: [
        {
            imageUrl: 'xxx',
            title: 'title',
            subtitle: 'subtitle',
            actions: [
                {
                    text: 'a',
                    postback: 'b',
                    fallback: 'b',
                }
            ]
        }
    ],
    actions: [
        {
            text: 'x',
            postback: 'y',
        },
        {
            text: 'w',
            postback: 'z',
            fallback: 'z',
        },
    ]
};

const sampleBotParams1 = {
    botId: uuid.v4(),
    botName: 'samplebot',
    defaultLanguage: 'en',
    publisherId: uuid.v4(),
    onlyAllowedUsersCanChat: false,
    settings: {
        ciscosparkAccessToken: 'xxx',
        ciscosparkBotPersonId: 'xxx',
        ciscosparkBotEmail: 'xxx',
        ciscosparkWebhookSecret: 'xxx',
        ciscosparkWebhookId: 'xxx',
        messengerPageAccessToken: 'xxx',
        messengerAppSecret: 'xxx',
        microsoftAppId: 'xxx',
        microsoftAppPassword: 'xxx',
        witAccessToken: WIT_ACCESS_TOKEN,
        twitterConsumerKey: 'xxx',
        twitterConsumerSecret: 'xxx',
        dashbotFacebookKey: '',
        dashbotGenericKey: '',
    },
    feeds: [],
};

const sampleConversationId1 = uuid.v4();
const sampleDBMessage1 = createSampleDBMessage(sampleBotParams1.publisherId, sampleConversationId1, 'x');
const sampleChannelData1 = {
    address: {},
};
const logSampleDBMessage1 = _.once(() => deepiksBot._logMessage(sampleDBMessage1));
const updateConversationsTable1 = _.once(() => {
    return deepiksBot._updateConversationTable(
        sampleDBMessage1, sampleBotParams1, sampleChannelData1);
});

const sampleConversation1 = {
    lastMessage: sampleDBMessage1,
    botId_conversationId: composeKeys(sampleBotParams1.botId, sampleConversationId1),
    botId_lastInteractiveMessageTimestamp_messageId:
        composeKeys(sampleBotParams1.botId, sampleDBMessage1.creationTimestamp, sampleDBMessage1.id),
    channel: sampleDBMessage1.channel,
    botId: sampleBotParams1.botId,
    publisherId: sampleBotParams1.publisherId,
    channelData: sampleChannelData1,
    lastParticipantProfilePic: sampleDBMessage1.senderProfilePic,
    participantsNames: aws.dynamoCreateSet([sampleDBMessage1.senderName]),
    participantsIds: aws.dynamoCreateSet([sampleDBMessage1.senderId]),
};

const sampleUser1 = {
    publisherId: sampleBotParams1.publisherId,
    botId_channel_userId: composeKeys(sampleBotParams1.botId, sampleDBMessage1.channel, sampleDBMessage1.senderId),
    prefs: {},
    userRole: 'user',
    userLastMessage: sampleDBMessage1,
    conversationId: sampleConversationId1,
}

describe('::', function() {
    this.timeout(15000);

    before(async function () {
        this.timeout(60000);
        await aws.initResources(1, 1);
    });

    it('i18n translations must be in sync', function() {
        expect(languages.length, 'at least one language must be defined').to.be.gte(1);
        expect(_.difference(_.keys(translations), languages).length === 0,
            'each language must have a translation and vice versa').to.be.true();

        const newTranslations = _.cloneDeepWith(
            translations,
            x => _.isPlainObject(x) ? undefined : typeof x
        );

        languages.slice(1).forEach(lang => {
            expect(newTranslations[lang], `compaing keys of ${lang} with ${languages[0]}`)
                .eql(newTranslations[languages[0]]);
        });
    });

    describe('=> deepiks-bot', function () {
        it('=> stores message to db', async function () {
            await logSampleDBMessage1();
            const qres = await aws.dynamoQuery({
                TableName: CONSTANTS.DB_TABLE_MESSAGES,
                KeyConditionExpression: 'publisherId_conversationId = :pc and creationTimestamp = :t',
                ExpressionAttributeValues: {
                    ':pc': sampleDBMessage1.publisherId_conversationId,
                    ':t': sampleDBMessage1.creationTimestamp,
                },
            });

            expect(qres.Count).eql(1);
            expect(qres.Items[0]).eql(sampleDBMessage1);
        });

        it('=> checks if message is in db', async function () {
            await logSampleDBMessage1();
            const res = await deepiksBot._isMessageInDB(sampleDBMessage1);
            expect(res).eql(true);
        });

        it('=> updates conversation table', async function () {
            await logSampleDBMessage1();
            await updateConversationsTable1();
            const {publisherId, botId} = sampleBotParams1;
            const [, conversationId] = decomposeKeys(sampleDBMessage1.publisherId_conversationId);

            const conv = await aws.getConversation(publisherId, botId, conversationId);
            expect(conv).eql(sampleConversation1);
        });

        it('=> updates users table', async function () {
            const {publisherId, botId} = sampleBotParams1;
            const [, conversationId] = decomposeKeys(sampleDBMessage1.publisherId_conversationId);
            const {channel, senderId} = sampleDBMessage1;

            await deepiksBot._updateUsersTable(sampleDBMessage1, sampleBotParams1);

            const user = await aws.getUserByUserId(publisherId, botId, channel, senderId);

            expect(user).eql(sampleUser1);
        });

        it('=> uploads to S3', async function () {
            const buf = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]);

            const key = uuid.v4();
            await deepiksBot._uploadToS3(key, buf);
            const res = await aws.s3GetObject({
                Bucket: CONSTANTS.S3_BUCKET_NAME,
                Key: key,
            });

            expect(Buffer.compare(buf, res.Body)).eql(0);
        });

        it('=> process attachments', async function () {
            const imageUrl = 'https://www.google.com.tr/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
            const message: WebhookMessage = {
                ...sampleDBMessage1,
                fetchCardImages: undefined,
                cards: [
                    {
                        imageUrl,
                        title: 'title',
                    }
                ],
            };
            const res = await deepiksBot._processAttachments(message, sampleBotParams1);
            expect(res, 'res must exist').exist();
            if (!res) return; // keep flow happy
            expect(res.length, 'res must have length 1').eql(1);
            expect(res[0].buffer, 'must return a buffer').instanceof(Buffer);
            expect(res[0].format, 'must add file extension').eql('png');

            const reqRes = await request({
                uri: imageUrl,
                encoding: null,
            });

            expect(Buffer.compare(res[0].buffer, reqRes.body),
                'buffer must be equal to direct download buffer').eql(0);

            const bucketAndKey = destructureS3Url(await res[0].urlP);
            expect(bucketAndKey, 'urlP must be s3 url').exist();
            if (!bucketAndKey) return; // keep flow happy
            const s3Res = await aws.s3GetObject({
                Bucket: bucketAndKey.bucket,
                Key: bucketAndKey.key,
            });
            expect(Buffer.compare(res[0].buffer, s3Res.Body),
                'buffer must be equal to s3 object buffer').eql(0);

        });

        describe('=> verify user', function() {
            const botParams: BotParams = {
                ...sampleBotParams1,
                onlyAllowedUsersCanChat: true,
            };
            const strings = translations.en.userVerification;

            const conversationId = uuid.v4();
            const { publisherId, botId } = botParams;

            let responses = [];
            const respondFn = (m) => {
                responses.push(m);
                return Promise.resolve();
            };

            const putIntoUsersTable = users => aws.dynamoBatchWriteHelper(
                CONSTANTS.DB_TABLE_USERS,
                users.map(x => ({
                    PutRequest: { Item: x }
                }))
            );
            afterEach(function() {
                responses = [];
            });

            it('=> existing user not authorized', async function() {
                const message = {
                    ...createSampleDBMessage(publisherId, conversationId),
                    text: 'xxx',
                };
                const { senderId, channel } = message;
                const existingUser = {
                    botId_channel_userId: composeKeys(botId, channel, senderId),
                    prefs: { },
                    publisherId,
                    isVerified: true,
                    userRole: 'none',
                };
                await deepiksBot._verifyUser(botParams, message, respondFn, existingUser);
                expect(responses, 'responses length').length(1);
                expect(responses[0].text, 'response text').eql(strings.userNotAuthorized);
            });

            it('=> non-existing user entered non-email', async function() {
                const message = {
                    ...createSampleDBMessage(publisherId, conversationId),
                    text: 'wrong',
                };
                await deepiksBot._verifyUser(botParams, message, respondFn);
                expect(responses, 'responses length').length(1);
                expect(responses[0].text, 'response text').eql(strings.enterEmail);
            });

            it('=> entered wrong email', async function() {
                const emailMessage = {
                    ...createSampleDBMessage(publisherId, conversationId),
                    text: 'wrong@wrong.com',
                };
                await deepiksBot._verifyUser(botParams, emailMessage, respondFn);
                expect(responses, 'responses length').length(1);
                expect(responses[0].text, 'response text').eql(strings.invalidEmail);
            });


            describe('=> handles existing user', function() {
                let email, emailMessage, senderId, channel, existingUser, fakeUserId,
                    fakeUser, verificationToken, userWithAssociatedFakeUserId, suffix;

                before(async function() {
                    email = `${uuid.v4()}@mock.com`;
                    suffix = uuid.v4();
                    emailMessage = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: email,
                    };
                    ({ senderId, channel } = emailMessage);
                    existingUser = {
                        botId_channel_userId: composeKeys(botId, channel, senderId),
                        prefs: {
                            aa: 123
                        },
                        publisherId,
                        userRole: 'user'
                    };
                    fakeUserId = `dummy::${uuid.v4()}`;
                    fakeUser = {
                        botId_channel_userId: composeKeys(botId, channel, fakeUserId),
                        botId_channel_email: composeKeys(botId, channel, email),
                        prefs: {},
                        publisherId,
                        userRole: 'user',
                        isFake: true
                    };

                    await putIntoUsersTable([existingUser, fakeUser]);
                });

                beforeEach(function() {
                    sinon.stub(_aws_, 'sesSendEmail');
                });

                afterEach(function() {
                    responses = [];
                    _aws_.sesSendEmail.restore();
                });

                it('=> entered email', async function() {
                    const emailMessage = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: email,
                    };

                    await deepiksBot._verifyUser(botParams, emailMessage, respondFn, existingUser);

                    expect(responses, 'responses length').length(1);
                    expect(responses[0].text, 'response text').eql(strings.verificationTokenSentFn(email));

                    expect(_aws_.sesSendEmail.calledOnce,
                        'sesSendEmail is called once').to.be.true();
                    expect(_aws_.sesSendEmail.args[0][0].Destination,
                        'correct email destination').eql({ ToAddresses: [ email ] });

                    userWithAssociatedFakeUserId = await aws.getUserByUserId(
                        publisherId, botId, channel, senderId);
                    const newFakeUser = await aws.getUserByUserId(
                        publisherId, botId, channel, fakeUserId)

                    expect(_.omit(newFakeUser, 'unverifiedVerificationToken'),
                        'compare fakeUser and newFakeUser').eql(fakeUser);
                    expect(newFakeUser.unverifiedVerificationToken,
                        'unverifiedVerificationToken must be set').string();

                    expect(userWithAssociatedFakeUserId).eql({
                        ...existingUser,
                        isVerified: false,
                        lastMessage: emailMessage,
                        associatedFakeUserId: fakeUserId,
                    });

                    verificationToken = newFakeUser.unverifiedVerificationToken;
                });

                it('=> ask for verification token', async function() {
                    const message = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: 'xxx',
                    };
                    await deepiksBot._verifyUser(botParams, message, respondFn, userWithAssociatedFakeUserId);
                    expect(responses, 'responses length').length(1);
                    expect(responses[0].text, 'response text').eql(strings.enterVerificationToken);
                });

                it('=> entered verification token', async function() {
                    const message = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: verificationToken,
                    };
                    await deepiksBot._verifyUser(botParams, message, respondFn, userWithAssociatedFakeUserId);

                    expect(responses, 'responses length').length(1);
                    expect(responses[0].text, 'response text').eql(strings.successfullyVerified);

                    const newRealUser = await aws.getUserByUserId(
                        publisherId, botId, channel, senderId);
                    const newFakeUser = await aws.getUserByUserId(
                        publisherId, botId, channel, fakeUserId)

                    expect(newFakeUser, 'must delete fake user').not.exist();
                    expect(newRealUser, 'must update real user').eql({
                        ...existingUser,
                        isVerified: true,
                        lastMessage: message,
                        botId_channel_email: fakeUser.botId_channel_email,
                        conversationId,
                        prefs: {
                            ...existingUser.prefs,
                            verificationToken,
                        }
                    });
                });
            });

            describe('=> handles non-existing user', function() {
                let email, suffix, emailMessage, senderId, channel, fakeUserId, fakeUser,
                    userWithAssociatedFakeUserId, verificationToken;
                before(async function() {
                    email = `${uuid.v4()}@mock.com`;
                    suffix = uuid.v4();
                    emailMessage = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: email,
                    };
                    ({ senderId, channel } = emailMessage);
                    fakeUserId = `dummy::${uuid.v4()}`;
                    fakeUser = {
                        botId_channel_userId: composeKeys(botId, channel, fakeUserId),
                        botId_channel_email: composeKeys(botId, channel, email),
                        prefs: {},
                        publisherId,
                        userRole: 'user',
                        isFake: true,
                    };

                    await putIntoUsersTable([fakeUser]);
                });

                beforeEach(function() {
                    sinon.stub(_aws_, 'sesSendEmail');
                });

                afterEach(function() {
                    responses = [];
                    _aws_.sesSendEmail.restore();
                });

                it('=> entered email', async function() {
                    const emailMessage = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: email,
                    };

                    await deepiksBot._verifyUser(botParams, emailMessage, respondFn);

                    expect(responses, 'responses length').length(1);
                    expect(responses[0].text, 'response text').eql(strings.verificationTokenSentFn(email));

                    expect(_aws_.sesSendEmail.calledOnce,
                        'sesSendEmail is called once').to.be.true();
                    expect(_aws_.sesSendEmail.args[0][0].Destination,
                        'correct email destination').eql({ ToAddresses: [ email ] });

                    userWithAssociatedFakeUserId = await aws.getUserByUserId(
                        publisherId, botId, channel, senderId);
                    const newFakeUser = await aws.getUserByUserId(
                        publisherId, botId, channel, fakeUserId)

                    expect(_.omit(newFakeUser, 'unverifiedVerificationToken'),
                        'compare fakeUser and newFakeUser').eql(fakeUser);
                    expect(newFakeUser.unverifiedVerificationToken,
                        'unverifiedVerificationToken must be set').string();

                    expect(userWithAssociatedFakeUserId).eql({
                        botId_channel_userId: composeKeys(botId, channel, senderId),
                        prefs: {},
                        publisherId,
                        userRole: 'none',
                        isVerified: false,
                        lastMessage: emailMessage,
                        associatedFakeUserId: fakeUserId,
                    });

                    verificationToken = newFakeUser.unverifiedVerificationToken;
                });

                it('=> ask for verification token', async function() {
                    const message = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: 'xxx',
                    };
                    await deepiksBot._verifyUser(botParams, message, respondFn, userWithAssociatedFakeUserId);
                    expect(responses, 'responses length').length(1);
                    expect(responses[0].text, 'response text').eql(strings.enterVerificationToken);
                });

                it('=> entered verification token', async function() {
                    const message = {
                        ...createSampleDBMessage(publisherId, conversationId, suffix),
                        text: verificationToken,
                    };
                    await deepiksBot._verifyUser(botParams, message, respondFn, userWithAssociatedFakeUserId);

                    expect(responses, 'responses length').length(1);
                    expect(responses[0].text, 'response text').eql(strings.successfullyVerified);

                    const newRealUser = await aws.getUserByUserId(
                        publisherId, botId, channel, senderId);
                    const newFakeUser = await aws.getUserByUserId(
                        publisherId, botId, channel, fakeUserId)

                    expect(newFakeUser, 'must delete fake user').not.exist();
                    expect(newRealUser, 'must update real user').eql({
                        botId_channel_userId: composeKeys(botId, channel, senderId),
                        publisherId,
                        userRole: 'user',
                        isVerified: true,
                        lastMessage: message,
                        botId_channel_email: fakeUser.botId_channel_email,
                        conversationId,
                        prefs: {
                            verificationToken,
                        }
                    });
                });
            });
        });
    });

    describe('=> Wit AI', function() {
        it('=> responds to hello', async function () {
            await logSampleDBMessage1();
            await updateConversationsTable1();

            const responses = [];
            const respondFn = (m) => {
                responses.push(m);
                return Promise.resolve();
            };

            await witAI.ai(
                sampleDBMessage1, sampleBotParams1, sampleConversation1,
                sampleUser1, respondFn
            );

            expect(responses.length, 'must have a response').gte(1);
            expect(responses[0].text, 'hi back');
        });

        describe('.', function() {
            let actionMessage, context, userPrefs;
            before(function() {
                userPrefs = {
                    favoritePainter: 'Van Gogh'
                };
                context = {
                    a: 123,
                };
                actionMessage = {
                    text: 'booo',
                    actions: [
                        {
                            text: 'button X',
                            postback: 'postback X',
                        },
                    ],
                };
                sinon.stub(serverUtils, 'request', req => {
                    if (req.uri === 'xxx') {
                        return Promise.resolve({
                            statusCode: 200,
                            body: {
                                msg: actionMessage,
                                context,
                                userPrefs,
                            },
                        });
                    }
                    return Promise.reject('uri must be xxx');
                });
            });

            after(function() {
                serverUtils.request.restore();
            });

            it('=> calls action', async function () {
                const message = {
                    ...createSampleDBMessage(sampleBotParams1.publisherId, sampleConversationId1, 'y'),
                    text: 'test action',
                };

                await deepiksBot._updateConversationTable(message, sampleBotParams1);

                await aws.dynamoPut({
                    TableName: CONSTANTS.DB_TABLE_AI_ACTIONS,
                    Item: {
                        action: 'testAction',
                        url: 'xxx',
                    },
                });

                const responses = [];
                const respondFn = (m) => {
                    responses.push(m);
                    return Promise.resolve();
                };

                await witAI.ai(
                    message, sampleBotParams1, sampleConversation1,
                    sampleUser1, respondFn
                );

                expect(_.omit(responses[0], 'creationTimestamp')).eql(actionMessage);
                expect(responses[0].creationTimestamp, 'must add creationTimestamp').gt(0);

                const {publisherId, botId} = sampleBotParams1;

                // check user prefs
                const user = await aws.getUserByUserId(publisherId, botId, message.channel, message.senderId);
                expect(user, 'user must exist').exist();
                expect(user.prefs, 'must update user.prefs').eql(userPrefs);

                // check witData
                const [, conversationId] = decomposeKeys(message.publisherId_conversationId);
                const conv = await aws.getConversation(publisherId, botId, conversationId);
                expect(conv, 'conversation must be updated').exist();
                expect(_.omit(conv.witData, 'sessionId'), 'witData must be updated').eql({
                    lastActionPrefix: 'thisStory',
                    context,
                });
                expect(conv.witData.sessionId, 'witData.sessionId must exist').exist();

            });

        });
    });

    describe('=> spark webhook', function() {
        let sampleWebhookReqBody, sig, req, res, statusCode, messageId, roomId,
            personId, personEmail, creationTimestamp, publisherId, botId, botParams,
            sentMessages;

        before(async function() {
            botParams = sampleBotParams1;
            ({ publisherId, botId } = botParams);
            messageId = uuid.v4();
            roomId = uuid.v4();
            personId = uuid.v4();
            personEmail = uuid.v4();
            creationTimestamp = Date.now();
            sampleWebhookReqBody = {
                id: 'xxx',
                name: 'xxx',
                resource: 'messages',
                event: 'created',
                data: {
                    id: messageId,
                    roomId,
                    personId,
                    personEmail,
                    created: creationTimestamp,
                },
            };

            const hmac = crypto.createHmac('sha1', botParams.settings.ciscosparkWebhookSecret);
            hmac.update(Buffer.from(JSON.stringify(sampleWebhookReqBody), 'utf-8'));
            sig = hmac.digest('hex');

            req = ({
                method: 'POST',
                get(x) {
                    if (x === 'X-Spark-Signature') {
                        return sig;
                    }
                },
                params: {
                    publisherId,
                    botId,
                },
                rawBody: Buffer.from(JSON.stringify(sampleWebhookReqBody), 'utf-8'),
                body: sampleWebhookReqBody,
            }: any);
            res = ({
                status(x) {
                    statusCode = x;
                },
                send() {
                    if (!statusCode) {
                        statusCode = 200;
                    }
                }
            }: any);

            sentMessages = [];
        });

        beforeEach(async function() {
            sinon.stub(_aws_, 'getBot', (pid, bid) => {
                if (pid === publisherId && bid === botId) {
                    return Promise.resolve(sampleBotParams1);
                }
                return Promise.resolve();
            });
            sinon.stub(deepiksBot, 'deepiksBot', async function(m, bp, rfn) {
                await rfn(sampleResponseMessage1);
            });
            sinon.stub(sparkClient, 'init', () => ({
                messages: {
                    get: mid => {
                        return Promise.resolve({
                            id: messageId,
                            roomId,
                            roomType: 'group',
                            text: 'hi',
                            personId,
                            personEmail,
                            created: creationTimestamp,
                        });
                    },
                    create: m => {
                        sentMessages.push(m);
                    }
                },
                people: {
                    get: pid => {
                        return Promise.resolve({
                            displayName: 'xxx',
                        });
                    },
                },
            }));
        });

        afterEach(async function() {
            deepiksBot.deepiksBot.restore();
            _aws_.getBot.restore();
            sparkClient.init.restore();
            sentMessages = [];
        });

        it('=> verifies signature and returns 200', async function() {
            await spark.webhook(req, res);
            expect(statusCode).eql(200);
        });

        it('=> sends message to deepiksBot', async function() {
            await spark.webhook(req, res);
            expect(deepiksBot.deepiksBot.calledOnce).to.be.true();
            expect(deepiksBot.deepiksBot.args[0][0]).eql({
                publisherId_conversationId: composeKeys(publisherId, roomId),
                creationTimestamp,
                id: messageId,
                senderId: personId,
                senderName: 'xxx',
                senderIsBot: false,
                channel: 'ciscospark',
                text: 'hi',
                fetchCardImages: undefined
            });
        });

        it('=> sends messages received from deepiksBot', async function() {
            await spark.webhook(req, res);
            // reportDebug('****', toStr(sentMessages));
            expect(sentMessages).eql([
                {
                    text: '',
                    files: [
                        'xxx'
                    ],
                    roomId,
                },
                {
                    text: 'b',
                    roomId,
                },
                {
                    text: 'abc\n(z)',
                    roomId,
                }
            ]);

        });
    });

    describe('=> messenger webhook', function() {
        let publisherId, botId, botParams, firstName, lastName, profilePic,
            originalRequest, sampleTextMessageBody, sig, req, res, statusCode,
            conversationId, sentMessages;

        before(async function() {
            botParams = sampleBotParams1;
            ({ publisherId, botId } = botParams);
            sampleTextMessageBody = {
                object: 'page',
                entry: [
                    {
                        id: '257424221305928',
                        time: 1467367307425,
                        messaging: [
                            {
                                sender: {
                                    id: '1118266251568559',
                                },
                                recpient: {
                                    id: '257424221305928',
                                },
                                timestamp: 1467367307394,
                                message: {
                                    mid: 'mid.1467367307265:c73f5c45afc8caf679',
                                    seq: 4,
                                    text: 'abc',
                                },
                            },
                        ],
                    },
                ],
            };

            req = ({
                method: 'POST',
                get(x) {
                    if (x === 'X-Hub-Signature') {
                        return sig;
                    }
                },
                params: {
                    publisherId,
                    botId,
                },
                rawBody: Buffer.from(JSON.stringify(sampleTextMessageBody), 'utf-8'),
                body: sampleTextMessageBody,
            }: any);
            res = ({
                status(x) {
                    statusCode = x;
                },
                send() {
                    if (!statusCode) {
                        statusCode = 200;
                    }
                }
            }: any);

            const hmac = crypto.createHmac('sha1', botParams.settings.messengerAppSecret);
            hmac.update(Buffer.from(JSON.stringify(sampleTextMessageBody), 'utf-8'));
            sig = 'sha1=' + hmac.digest('hex');

            firstName = lastName = profilePic = 'xxx';
            conversationId = ['257424221305928', '1118266251568559'].join('::');
            sentMessages = [];
        });

        beforeEach(async function() {
            sinon.stub(_aws_, 'getBot', (pid, bid) => {
                if (pid === publisherId && bid === botId) {
                    return Promise.resolve(sampleBotParams1);
                }
                return Promise.resolve();
            });
            sinon.stub(deepiksBot, 'deepiksBot', async function(m, bp, rfn) {
                await rfn(sampleResponseMessage1);
            });
            sinon.stub(serverUtils, 'request', req => {
                if (req.uri === 'https://graph.facebook.com/v2.6/1118266251568559') {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            first_name: firstName,
                            last_name: lastName,
                            profile_pic: profilePic,
                        },
                    });
                } else if (req.uri === 'https://graph.facebook.com/v2.6/me/messages') {
                    sentMessages.push(req.json);
                    return Promise.resolve({ statusCode: 200 });
                }
                return Promise.reject('uri must be xxx');
            });
        });

        afterEach(function() {
            _aws_.getBot.restore();
            deepiksBot.deepiksBot.restore();
            serverUtils.request.restore();
            statusCode = null;
            sentMessages = [];
        });

        it('=> verifies signature and returns 200', async function() {
            await messenger.webhook(req, res);
            expect(statusCode).eql(200);
        });

        it('=> sends message to deepiksBot', async function() {
            await messenger.webhook(req, res);

            expect(deepiksBot.deepiksBot.calledOnce).to.be.true();
            expect(deepiksBot.deepiksBot.args[0][0]).eql({
                publisherId_conversationId: composeKeys(publisherId, conversationId),
                creationTimestamp: 1467367307394,
                id: 'mid.1467367307265:c73f5c45afc8caf679',
                senderId: '1118266251568559',
                senderIsBot: false,
                channel: 'messenger',
                text: 'abc',
                cards: undefined,
                senderName: 'xxx xxx',
                senderProfilePic: 'xxx'
            });
        });

        it('=> sends messages received from deepiksBot', async function() {
            await messenger.webhook(req, res);
            expect(sentMessages).eql([
                {
                    recipient: {
                        id: '1118266251568559'
                    },
                    message: {
                        attachment: {
                            type: 'template',
                            payload: {
                                template_type: 'generic',
                                elements: [
                                    {
                                        title: 'title',
                                        subtitle: 'subtitle',
                                        image_url: 'xxx',
                                        buttons: [
                                            {
                                                type: 'web_url',
                                                title: 'Open Image',
                                                url: 'xxx'
                                            },
                                            {
                                                type: 'postback',
                                                title: 'a',
                                                payload: 'b'
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                },
                {
                    recipient: {
                        id: '1118266251568559'
                    },
                    message: {
                        text: 'abc',
                        quick_replies: [
                            {
                                content_type: 'text',
                                title: 'x',
                                payload: 'y'
                            },
                            {
                                content_type: 'text',
                                payload: 'z',
                                title: 'w',
                            }
                        ]
                    }
                }
            ]);
        });
    });


    describe('=> utils', function() {
        it('=> dynamoCleanUpObj', function() {
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

            expect(aws.dynamoCleanUpObj(x)).eql({
                a:1,
                b:0,
                c: {},
                e: {
                    g: 'a',
                    h: [],
                    j: [1, null, '', undefined],
                },
            });
        });
    });


    describe('=> conversational engine', function() {
        describe('bookmarks', function() {
            const bookmarks = ce._collectBookmarks(testStories.data);
            it('collectBookmarks', () => {
                expect(bookmarks).eql({
                    b1: [0, 0, 0],
                    b2: [0, 1, 0],
                    b3: [1, 1, 1, 0, 1],
                    b4: [1, 1, 1, 0, 2, 0, 0, 3, 0, 0, 0],
                });
            });
        });

        describe('converse', function() {
            let converseRes;
            it('do nothing', () => {
                converseRes = ce._converse(null, {}, {}, testStories.data, {});
                expect(converseRes).eql({
                    type: 'stop',
                    session: {
                        leafIsExpectingUserInput: false,
                        path: [],
                    },
                });
            });

            describe('hi', function() {

                it('send', () => {
                    converseRes = ce._converse('hi', converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: '<[ delay: 1; as user ]> hi back'
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [0, 0, 1]
                        }
                    });

                });

                it('converse 1', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: 'will reply in a minute'
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [0, 0, 2]
                        },
                    });
                });

                it('converse 2', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        session: {
                            leafIsExpectingUserInput: true,
                            path: [0, 1],
                        },
                        type: 'stop',
                    });
                });

                it('converse 3', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        session: {
                            leafIsExpectingUserInput: true,
                            path: [0, 1],
                        },
                        type: 'stop',
                    });

                });
            });

            describe('hihi', function() {
                it('send', () => {
                    converseRes = ce._converse('hihi', converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: 'hihi back',
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [0, 1, 1]
                        }
                    });
                });

                it('converse 1', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: '<[ delay: 1; as user ]> hi back'
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [0, 0, 1]
                        }
                    });

                });

                it('converse 2', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: 'will reply in a minute'
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [0, 0, 2]
                        },
                    });
                });

                it('converse 3', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'stop',
                        session: {
                            leafIsExpectingUserInput: true,
                            path: [0, 1],
                        }
                    })
                });
            });

            describe('bye', function() {
                it('send', () => {
                    converseRes = ce._converse('bye', converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: 'bye back',
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [1, 0, 0]
                        }
                    });
                });

                it('converse 1', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'stop',
                        session: {
                            leafIsExpectingUserInput: true,
                            path: [1, 1],
                        }
                    })
                });

                it('converse 2', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'stop',
                        session: {
                            leafIsExpectingUserInput: true,
                            path: [1, 1],
                        }
                    })
                });
            });

            describe('dfqwsfsdfffwasdf', function() {
                it('send', () => {
                    converseRes = ce._converse('dfqwsfsdfffwasdf', converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'action',
                        action: 'aaa',
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [1, 1, 1, 0, 0],
                        }
                    })
                });

                it('converse 1', () => {
                    const context = {
                        bb: true,
                        ff: true,
                    };
                    converseRes = ce._converse(null, converseRes.session, context, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: 'rr',
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [1, 1, 1, 0, 2, 0, 0, 1],
                        }
                    });
                });

                it('converse 2', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'action',
                        action: 'vvv',
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [1, 1, 1, 0, 2, 0, 0, 2],
                        }
                    });
                });

                it('converse 3', () => {
                    const context = {
                        x: true
                    };
                    converseRes = ce._converse(null, converseRes.session, context, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'stop',
                        session: {
                            leafIsExpectingUserInput: true,
                            path: [1, 1, 1, 0, 2, 0, 0, 3, 0, 1, 0],
                        }
                    });
                });
            });

            describe('wer', function() {
                it('send', () => {
                    converseRes = ce._converse('wer', converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: 'werback',
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [1, 1, 1, 0, 2, 0, 0, 3, 0, 1, 0, 0],
                        }
                    })
                });

                it('converse 1', () => {
                    converseRes = ce._converse(null, converseRes.session, {}, testStories.data, {});
                    expect(converseRes).eql({
                        type: 'stop',
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [],
                        }
                    });
                });
            });
            describe('change mid story', function() {
                it('send hi', () => {
                    converseRes = ce._converse('hi', converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: '<[ delay: 1; as user ]> hi back',
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [0, 0, 1],
                        }
                    })
                });
                it('send bye', () => {
                    converseRes = ce._converse('bye', converseRes.session, {}, testStories.data);
                    expect(converseRes).eql({
                        type: 'msg',
                        msg: {
                            text: 'bye back',
                        },
                        session: {
                            leafIsExpectingUserInput: false,
                            path: [1, 0, 0],
                        }
                    })
                });

            });
        });

        describe('=> Learn from human transfer', function() {
            let placeholderTurn, learnedTurn, inputMessage, responseText;
            before(function() {
                responseText = 'xxx';
                inputMessage = { text: 'dummy input' };
                placeholderTurn = {
                    user: '',
                    placeholder: true,
                    entities: [],
                    operations: [],
                };
                learnedTurn = {
                    user: inputMessage.text,
                    entities: [],
                    operations: [
                        {
                            action: `template-${responseText}`
                        }
                    ],
                };
            });

            it('=> at branch, expecting reply', async function() {
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [1, 1],
                        leafIsExpectingUserInput: true,
                    },
                    testStories.data,
                    true
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: true,
                        path: [1, 1, 2, 1],
                    },
                    stories: ice.assocIn(
                        testStories.data,
                        [1, 'turns', 1, 'branches', 2],
                        [
                            learnedTurn,
                            placeholderTurn,
                        ]
                    ),
                });
            });

            it('=> at branch, not expecting reply', async function() {
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [1, 1],
                        leafIsExpectingUserInput: true,
                    },
                    testStories.data,
                    false
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: false,
                        path: [],
                    },
                    stories: ice.assocIn(
                        testStories.data,
                        [1, 'turns', 1, 'branches', 2],
                        [learnedTurn]
                    ),
                });
            });

            it('=> at placeholder user, expecting reply', async function() {
                const stories = ice.assocIn(
                    testStories.data, [0, 'turns', 2], placeholderTurn
                );
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [0, 2],
                        leafIsExpectingUserInput: true,
                    },
                    stories,
                    true
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: true,
                        path: [0, 3],
                    },
                    stories: ice.chain(stories)
                        .assocIn([0, 'turns', 2], learnedTurn)
                        .assocIn([0, 'turns', 3], placeholderTurn)
                        .value(),
                });
            });

            it('=> at placeholder user, not expecting reply', async function() {
                const stories = ice.assocIn(
                    testStories.data, [0, 'turns', 2], placeholderTurn
                );
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [0, 2],
                        leafIsExpectingUserInput: true,
                    },
                    stories,
                    false
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: false,
                        path: [],
                    },
                    stories: ice.assocIn(
                        stories, [0, 'turns', 2], learnedTurn
                    ),
                });
            });

            it('=> at non-placeholder user, expecting reply', async function() {
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [2, 1],
                        leafIsExpectingUserInput: true,
                    },
                    testStories.data,
                    true
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: true,
                        path: [2, 1, 1, 1],
                    },
                    stories: ice.assocIn(testStories.data, [2, 'turns'], [
                        testStories.data[2].turns[0],
                        {
                            branches: [
                                testStories.data[2].turns.slice(1),
                                [
                                    learnedTurn,
                                    placeholderTurn,
                                ]
                            ]
                        }
                    ])
                });
            });

            it('=> at non-placeholder user, not expecting reply', async function() {
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [2, 1],
                        leafIsExpectingUserInput: true,
                    },
                    testStories.data,
                    false
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: false,
                        path: [],
                    },
                    stories: ice.assocIn(testStories.data, [2, 'turns'], [
                        testStories.data[2].turns[0],
                        {
                            branches: [
                                testStories.data[2].turns.slice(1),
                                [
                                    learnedTurn,
                                ]
                            ]
                        }
                    ])
                });
            });

            it('=> empty session, expecting reply', async function() {
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [],
                        leafIsExpectingUserInput: false,
                    },
                    testStories.data,
                    true
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: true,
                        path: [3, 1],
                    },
                    stories: ice.push(testStories.data, {
                        name: '',
                        turns: [
                            learnedTurn,
                            placeholderTurn,
                        ]
                    }),
                });
            });

            it('=> empty session, not expecting reply', async function() {
                const res = ce._learnFromHumanTransfer(
                    responseText,
                    inputMessage,
                    {
                        path: [],
                        leafIsExpectingUserInput: false,
                    },
                    testStories.data,
                    false
                );

                expect(res).eql({
                    session: {
                        leafIsExpectingUserInput: false,
                        path: [],
                    },
                    stories: ice.push(testStories.data, {
                        name: '',
                        turns: [
                            learnedTurn,
                        ]
                    }),
                });
            });
        });
    });

    // it('tests3', async function() {
    //
    //     const zip = new JSZip();
    //     zip.file('stories.json', 'boooya222');
    //     const zipStream = zip.generateNodeStream({
    //         type: 'nodebuffer',
    //         streamFiles: true,
    //     });
    //
    //     await aws.s3Upload({
    //         Bucket: CONSTANTS.S3_BUCKET_NAME,
    //         Key: `tests3/bot.zip`,
    //         Body: zipStream,
    //     });
    // });

});
