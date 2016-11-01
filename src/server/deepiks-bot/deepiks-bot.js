/* @flow */

import * as aws from '../../aws/aws.js';
import { callbackToPromise, toStr, destructureS3Url, timeout,
         composeKeys, decomposeKeys, waitForAll,
         shortLowerCaseRandomId } from '../../misc/utils.js';
import { request, CONSTANTS } from '../server-utils.js';
import witAI from './wit-ai.js';
import customAI from './custom-ai.js';
import type { DBMessage, WebhookMessage, ResponseMessage, BotParams,
              ChannelData, Conversation, RespondFn, User } from '../../misc/types.js';
import { translations as tr, languages as langs } from '../i18n/translations.js';
import URL from 'url';
import gm from 'gm';
import _ from 'lodash';
import uuid from 'node-uuid';
const reportDebug = require('debug')('deepiks:deepiks-bot');
const reportError = require('debug')('deepiks:deepiks-bot:error');

type ProcessedAttachment = {
    urlP: Promise<string>,
    buffer: Buffer,
    format: string,
};


class FunctionQueue {
    queue: Array<{ fn: Function, resolve: Function, reject: Function }>;
    isActive: boolean;

    constructor() {
        this.queue = [];
        this.isActive = false;
    }

    enqueue(fn: Function) {
        let x;
        const p = new Promise((resolve, reject) => {
            x = { fn, resolve, reject };
        });
        reportDebug('FunctionQueue enqueue x: ', x);
        this.queue.push(x);
        if (!this.isActive) {
            this.isActive = true;
            process.nextTick(() => this._run());
        }
        return p;
    }

    _run() {
        if (this.queue.length === 0) {
            reportDebug('FunctionQueue is now empty');
            this.isActive = false;
            return;
        }
        reportDebug('FunctionQueue executing an item');

        const item = this.queue.shift();

        let ret;
        try {
            ret = item.fn();
        } catch(error) {
            item.reject(error);
            return process.nextTick(() => this._run());
        }

        ret = Promise.resolve(ret);
        ret.then(x => {
            item.resolve(x);
            process.nextTick(() => this._run());
        }, error => {
            item.reject(error);
            process.nextTick(() => this._run());
        });

        // make it a promise if it's not already one
        // ret = Promise.resolve(ret);
        // ret.then(item.resolve, item.reject);
        // this._run();
    }
}

const _functionQueue_ = new FunctionQueue();

function textToResponseMessage(text: string): ResponseMessage {
    return { text, creationTimestamp: Date.now() };
}

async function isMessageInDB(message: DBMessage) {
    reportDebug('isMessageInDB');
    const qres = await aws.dynamoQuery({
        TableName: CONSTANTS.DB_TABLE_MESSAGES,
        KeyConditionExpression: 'publisherId_conversationId = :pc and creationTimestamp = :t',
        ExpressionAttributeValues: {
            ':pc': message.publisherId_conversationId,
            ':t': message.creationTimestamp,
        },
    });
    return qres.Count > 0;
}

async function verifyUser(
    botParams: BotParams, message: DBMessage, respondFn: RespondFn, user: ?User
) {
    /*

     Possible situations:
     1. Existing user, verified but not allowed
     2. Existing user in a new private bot
     3. Non-existing user in a private bot
     4. real user with updated email
     5. fake user with updated email

    -------

    to change email
        update user.botId_channel_email,
        remove user.prefs.verificationToken
               user.isVerified
               user.unverifiedVerificationToken

     */

    reportDebug('verifyUser user: ', user);

    const strings = (tr[botParams.defaultLanguage] || tr[langs[0]]).userVerification;
    if (user && user.isVerified && user.userRole === 'none') {
        return await respondFn(textToResponseMessage(strings.userNotAuthorized));
    }


    const text = (message.text || '').trim().toLowerCase();
    if (!text) return;

    const { publisherId, botId } = botParams;
    const { channel, senderId } = message;

    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
    if (emailMatch) {
        const email = emailMatch[0];
        const userWithEmail = await aws.getUserByEmail(
            publisherId, botId, channel, email
        );

        reportDebug(`verifyUser email: ${email}, userWithEmail: `, userWithEmail);
        // validate email
        if (!userWithEmail || !userWithEmail.isFake &&
            user && user.botId_channel_userId !== userWithEmail.botId_channel_userId)
        {
            return await respondFn(textToResponseMessage(strings.invalidEmail));
        }

        // given: userWithEmail === user || userWithEmail.isFake
        //        user may exist

        // update userWithEmail if it's a fake user
        if (userWithEmail.isFake) {
            const [,, fakeUserId] = decomposeKeys(userWithEmail.botId_channel_userId);
            await aws.dynamoUpdate({
                TableName: CONSTANTS.DB_TABLE_USERS,
                Key: {
                    publisherId,
                    botId_channel_userId: composeKeys(botId, channel, senderId),
                },
                UpdateExpression:
                    'set associatedFakeUserId = :afui' +
                    ',   isVerified           = :iv' +
                    ',   prefs                = if_not_exists(prefs, :p)' +
                    ',   userRole             = if_not_exists(userRole, :ur)' +
                    ',   lastMessage          = :lm',
                ExpressionAttributeValues: {
                    ':afui': fakeUserId,
                    ':iv':   false,
                    ':p':    {},
                    ':ur':   'none',
                    ':lm':   message,
                },
            });
        }

        // update userWithEmail.unverifiedVerificationToken = new token
        const newVerificationToken = shortLowerCaseRandomId();
        reportDebug('verifyUser newVerificationToken: ', newVerificationToken);
        await aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_USERS,
            Key: {
                publisherId,
                botId_channel_userId: userWithEmail.botId_channel_userId,
            },
            UpdateExpression: 'set unverifiedVerificationToken = :uvt',
            ExpressionAttributeValues: {
                ':uvt': newVerificationToken,
            },
        });

        // email new verification token to user
        const emailParams = {
            Destination: {
                ToAddresses: [ email ],
            },
            Message: {
                Body: {
                    Text: {
                        Data: strings.verificationTokenEmailBodyFn(newVerificationToken),
                        Charset: 'UTF-8',
                    },
                },
                Subject: {
                    Data: strings.verificationTokenEmailSubjectFn(botParams.botName),
                    Charset: 'UTF-8'
                },
            },
            Source: CONSTANTS.EMAIL_ACTION_FROM_ADDRESS,
        };
        reportDebug(' sendEmail: ', toStr(emailParams));
        await aws.sesSendEmail(emailParams);

        return await respondFn(textToResponseMessage(strings.verificationTokenSentFn(email)));
    }

    // got token
    const token = text;

    // make sure we are expecting a verification token
    if (!user || (!user.unverifiedVerificationToken && !user.associatedFakeUserId)) {
        return await respondFn(textToResponseMessage(strings.enterEmail));
    }

    // the unverifiedVerificationToken is either in user or the
    // fake associated user. The latter takes precedence.
    let userWithUVT = user;
    if (user.associatedFakeUserId) {
        userWithUVT = await aws.getUserByUserId(
            publisherId, botId, channel, user.associatedFakeUserId
        );
        if (!userWithUVT) {
            throw new Error(` invalid associatedFakeUserId: ` +
                            `${user.associatedFakeUserId || ''}`);
        }
    }
    reportDebug('verifyUser userWithUVT: ', userWithUVT);

    // check verification token
    if (token !== userWithUVT.unverifiedVerificationToken) {
        return await respondFn(textToResponseMessage(strings.enterVerificationToken));
    }

    // update user
    await aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_USERS,
        Key: {
            publisherId,
            botId_channel_userId: composeKeys(botId, channel, senderId),
        },
        UpdateExpression:
            ' SET    botId_channel_email      = :bce ' +
            ',       userRole                 = :ur  ' +
            ',       isVerified               = :iv  ' +
            ',       prefs.verificationToken  = :t   ' +
            ',       lastMessage              = :lm  ' +
            ' REMOVE associatedFakeUserId            ' +
            ',       unverifiedVerificationToken     ',
        ExpressionAttributeValues: {
            ':bce': userWithUVT.botId_channel_email,
            ':ur':  userWithUVT.userRole,
            ':iv':  true,
            ':t':   token,
            ':lm':  message,
        },
    });


    // delete the fake user
    if (userWithUVT.isFake) {
        await aws.dynamoDelete({
            TableName: CONSTANTS.DB_TABLE_USERS,
            Key: {
                publisherId,
                botId_channel_userId: userWithUVT.botId_channel_userId,
            }
        });
    }

    return await respondFn(textToResponseMessage(strings.successfullyVerified));


}

function createDBMessageFromResponseMessage(
    m: ResponseMessage, botParams: BotParams,
    conversationId: string, channel: string
) : DBMessage
{
    const ct = m.creationTimestamp;
    if (!ct) {
        throw new Error(`createDBMessageFromResponseMessage message is ` +
                        `missing creationTimestamp: ${toStr(m)}`)
    }
    return {
        publisherId_conversationId: composeKeys(botParams.publisherId, conversationId),
        senderId: [botParams.publisherId, botParams.botId].join('::'),
        senderName: botParams.botName,
        channel: channel,
        senderIsBot: true,
        id: uuid.v4(),
        text: m.text,
        cards: m.cards,
        actions: m.actions,
        creationTimestamp: ct,
        poll: m.poll && {
            pollId: m.poll.pollId,
            questionId: m.poll.questionId,
            isQuestion: true,
        },
    }
}

async function logResponseMessage(ms: ResponseMessage | Array<ResponseMessage>,
                                          botParams: BotParams, conversationId: string,
                                          channel: string)
{
    const messages = Array.isArray(ms)
        ? ms : [ms];

    await logMessage(messages.map(
        x => createDBMessageFromResponseMessage(x, botParams, conversationId, channel)
    ));
}

async function logMessage(ms: DBMessage | Array<DBMessage>) {
    const messages = Array.isArray(ms)
        ? ms : [ms];
    reportDebug('logMessage: ', toStr(messages));

    await aws.dynamoBatchWriteHelper(
        CONSTANTS.DB_TABLE_MESSAGES,
        messages.map(x => ({
            PutRequest: {
                Item: aws.dynamoCleanUpObj(x),
            },
        }))
    );

    reportDebug('logMessage end');
}

function respondFnPreprocessorActionsMiddleware(
    next: RespondFn,
    botParams: BotParams,
    conversationId: string,
    channel: string,
    sendAsUser: (msg: DBMessage) => Promise<*>
): RespondFn
{
    return async function self(response) {
        const pas = response.preprocessorActions;
        if (!pas || pas.length === 0) {
            await next(response);
            return;
        }
        reportDebug('respondFnPreprocessorActionsMiddleware self: ', pas);

        const delayAction = pas.find(x => x.action === 'delay' && Number(x.args[0]));
        const pollAction = pas.find(x => x.action === 'poll' && x.args[0] && x.args[1]);
        const asUserAction = pas.find(x => x.action === 'as user');
        const emailAction = pas.find(x => x.action === 'email' && x.args[0]);

        if (delayAction && pollAction) {
            const m = `Cannot use 'delay' and 'poll' preprocessor actions together`;
            reportError(m);
            await next({ text: m, creationTimestamp: Date.now() });
            return;
        }

        if (emailAction && asUserAction) {
            const m = `Cannot user 'email' and 'as user' preprocessor actions together`;
            reportError(m);
            await next({ text: m, creationTimestamp: Date.now() });
            return;
        }

        if (delayAction) {
            // remove the action and schedule it
            const newResponse = {
                ...response,
                preprocessorActions: _.without(pas, delayAction),
            }
            const scheduleTimestamp = Date.now() + Number(delayAction.args[0]) * 1000 * 60;
            await aws.dynamoPut({
                TableName: CONSTANTS.DB_TABLE_SCHEDULED_TASKS,
                Item: {
                    dummy: '.',
                    scheduleTimestamp_taskId: composeKeys(scheduleTimestamp, uuid.v4()),
                    publisherId: botParams.publisherId,
                    botId: botParams.botId,
                    conversationId,
                    message: newResponse,
                    type: 'message',
                }
            });
            return;
        }

        if (pollAction) {
            const [ pollId, questionId ] = pollAction.args;
            const newResponse = {
                ...response,
                poll: { pollId, questionId },
                preprocessorActions: _.without(pas, pollAction),
            };
            await self(newResponse);
        }

        if (emailAction) {
            let [ email, subject = 'Conversation' ] = emailAction.args;
            if (!email) {
                reportDebug('emailAction invalid email: ', email);
            }

            const message = `See the full conversation at:\n\n${CONSTANTS.OWN_BASE_URL}` +
                            `/transcripts/${botParams.botId}/${conversationId}`;

            const emailParams = {
                Destination: {
                    ToAddresses: [
                        email,
                    ],
                },
                Message: {
                    Body: {
                        Text: {
                            Data: message,
                            Charset: 'UTF-8',
                        },
                    },
                    Subject: {
                        Data: subject,
                        Charset: 'UTF-8'
                    },
                },
                Source: CONSTANTS.EMAIL_ACTION_FROM_ADDRESS,
            };

            reportDebug('emailAction emailParams: ', emailParams);
            await aws.sesSendEmail(emailParams);

            const newResponse = {
                ...response,
                preprocessorActions: _.without(pas, emailAction),
            };
            await self(newResponse);
        }

        if (asUserAction) {
            reportDebug('asUserAction: ', response.text);
            const message = createDBMessageFromResponseMessage({
                text: response.text,
                creationTimestamp: Date.now(),
            }, botParams, conversationId, channel);

            // TODO Now that we're using FunctionQueue, this timeout should be unnecessary
            // testing required.
            await timeout(3000);
            await sendAsUser(message);
        }

    };
}

function respondFnCollectorMiddleware(next: RespondFn, toCollection: ResponseMessage[]): RespondFn {
    return response => {
        toCollection.push(response);
        return next(response);
    }
}

function respondFnSignS3UrlsMiddleware(next: RespondFn): RespondFn {
    return async function(response) {
        const newResponse = await signS3Urls(response)
        await next(newResponse);
    }
}

async function signS3Urls(response: ResponseMessage): Promise<ResponseMessage> {
    const clone = { ...response };
    let cardsP;
    if (clone.cards) {
        cardsP = Promise.all(clone.cards.map(async function(c) {
            const bucketAndKey = destructureS3Url(c.imageUrl);
            if (!bucketAndKey || bucketAndKey.bucket !== CONSTANTS.S3_BUCKET_NAME) {
                return c;
            }

            const newImageUrl = await aws.s3GetSignedUrl('getObject', {
                Bucket: bucketAndKey.bucket,
                Key: bucketAndKey.key,
                Expires: 60 * 10, // 10 minutes
            });
            return {
                ...c,
                imageUrl: newImageUrl,
            };
        }));
    }

    if (cardsP) {
        clone.cards = await cardsP;
    }
    return clone;
}

async function uploadToS3(key: string, buffer: Buffer) {
    const startTime = Date.now();
    reportDebug('uploadToS3: key: ', key);

    const res = await aws.s3Upload({
        Bucket: CONSTANTS.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
    });
    reportDebug('PROFILING: s3 time upload: %s ms', Date.now() - startTime);
    reportDebug(`Location: ${res.Location}`);
    return res.Location;
}

async function getFileFormat(buffer: Buffer): Promise<string> {
    const gmImg = gm(buffer);
    const formatFn = callbackToPromise(gmImg.format, gmImg);
    try {
        return (await formatFn()).toLowerCase();
    } catch(err) { }
    return '';
}

async function processAttachments(message: WebhookMessage, botParams: BotParams)
: Promise<?Array<ProcessedAttachment>>
{
    reportDebug('processAttachments');
    const { cards, fetchCardImages } = message;

    if (!cards && !fetchCardImages) {
        return null;
    }

    let downloads: Array<Buffer> = [];
    if (cards) {
        const startTime = Date.now();
        const rawDownloads = await Promise.all(cards.map(
            c => request({
                url: URL.parse(c.imageUrl),
                encoding: null,
            })
        ));
        reportDebug('PROFILING: raw download time: %s ms', Date.now() - startTime);
        downloads = rawDownloads.map(x => x.body);
    } else if (fetchCardImages) {
        const startTime = Date.now();
        downloads = await Promise.all(fetchCardImages.map(f => f()));
        reportDebug('PROFILING: raw download time: %s ms', Date.now() - startTime);
    }
    const formats = await Promise.all(downloads.map(getFileFormat));

    const s3LocationAndFormatPs = _.zip(downloads, formats).map(([buffer, format], i) => {
        const [pid] = decomposeKeys(message.publisherId_conversationId);
        const bid = botParams.botId;
        // const mid = message.id;
        const sid = message.senderId;
        const t = message.creationTimestamp;
        const extension = format ? '.' + format : '';
        return {
            urlP: uploadToS3(`${pid}/${bid}/${sid}/${t}_${i}${extension}`, buffer),
            format,
        };
    });

    return _.zipWith(downloads, s3LocationAndFormatPs, (buffer, { urlP, format }) => ({
        buffer,
        urlP,
        format,
    }));
}

function webhookMessageToDBMessage(message: WebhookMessage): DBMessage {
    const { fetchCardImages, ...rest } = message;
    return rest;
}

async function insertAttachmentsIntoMessage(
    message: DBMessage,
    attachments: Array<ProcessedAttachment>
): Promise<DBMessage> {

    const newMessage = { ...message };
    const allImages = await Promise.all(attachments.map(a => a.urlP));
    newMessage.cards = allImages.map((imageUrl, i) => ({
        ...(newMessage.cards && newMessage.cards[i]),
        imageUrl,
    }));
    return newMessage;
}

// if the message is a poll answer, it'll store the answer for the poll in DB
// and return the same message with its `poll` field set appropriately
async function pollMiddleware(
    message: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn
) : Promise<DBMessage>
{
    const lastMessage = await getLastMessageInConversation(
        message.publisherId_conversationId,
        message.creationTimestamp);
    if (!lastMessage || !lastMessage.poll || !lastMessage.poll.isQuestion) {
        return message;
    }

    const { pollId, questionId } = lastMessage.poll;

    reportDebug(`pollMiddleware pollId: ${pollId}, ` +
                `questionId: ${questionId}, ` +
                `answer: ${message.text || ''}`);

    const pollQuestion = await aws.getPollQuestion(botParams.publisherId, botParams.botId, pollId, questionId);
    reportDebug('pollMiddleware pollQuestion: ', pollQuestion);
    const pollAnswer = (message.text || '').trim().substr(0, 100).toLowerCase();

    // if (!pollQuestion.validAnswers.find(x => String(x).toLowerCase() === pollAnswer)) {
    //     reportDebug('pollMiddleware got ', pollAnswer, ', but expected one of ', pollQuestion.validAnswers);
    //     respondFn({ text: 'Invalid answer', creationTimestamp: Date.now() });
    //     return message;
    // }

    const keys = {
        publisherId: botParams.publisherId,
        botId_pollId_questionId: composeKeys(botParams.botId, pollId, questionId),
    };

    if (pollQuestion) {
        await aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_POLL_QUESTIONS,
            Key: keys,
            // UpdateExpression: 'SET feeds = list_append(if_not_exists(feeds, :emptyList), :newFeed)',
            UpdateExpression: 'SET aggregates.#answer = if_not_exists(aggregates.#answer, :zero) + :one',
            ExpressionAttributeNames: {
                '#answer': pollAnswer,
            },
            ExpressionAttributeValues: {
                ':one': 1,
                ':zero': 0,
            },
        });
    } else {
        await aws.dynamoPut({
            TableName: CONSTANTS.DB_TABLE_POLL_QUESTIONS,
            Item: {
                ...keys,
                aggregates: {
                    [pollAnswer]: 1,
                }
            },
        });
    }

    return {
        ...message,
        poll: {
            pollId,
            questionId,
            isQuestion: false,
        },
    };
}

async function getLastMessageInConversation(
    publisherId_conversationId: string,
    before: number
) : Promise<?DBMessage>
{
    const qres = await aws.dynamoQuery({
        TableName: CONSTANTS.DB_TABLE_MESSAGES,
        KeyConditionExpression: 'publisherId_conversationId = :pc and creationTimestamp < :t',
        ExpressionAttributeValues: {
            ':pc': publisherId_conversationId,
            ':t': before,
        },
        ScanIndexForward: false,
    });
    return qres.Items[0];
}

/**
 * updates the conversation table, creating a new item if necessary
 */
async function updateConversationTable(message: DBMessage,
                                       botParams: BotParams,
                                       channelData?: ChannelData)
{
    reportDebug('updateConversationTable');
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);

    const sets = [
        'lastMessage = :lastMessage',
        'botId_lastInteractiveMessageTimestamp_messageId = :blimtm',
        'channel = :chan',
        'botId = :botId',
        channelData && 'channelData = :cd',
        !message.senderIsBot && message.senderProfilePic && 'lastParticipantProfilePic = :profilePic',
    ].filter(Boolean).join(', ');

    const adds = [
        !message.senderIsBot && 'participantsNames :senderNameSet',
        !message.senderIsBot && 'participantsIds :senderIdSet',
    ].filter(Boolean).join(', ');

    const removes = [
         !channelData && 'channelData',
    ].filter(Boolean).join(', ');

    await aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
        Key: {
            publisherId,
            botId_conversationId: composeKeys(botParams.botId, conversationId),
        },
        UpdateExpression: (sets ? 'SET ' + sets : '') +
                          (adds ? ' ADD ' + adds : '') +
                          (removes ? ' REMOVE ' + removes : ''),
        ExpressionAttributeValues: {
            ':lastMessage': aws.dynamoCleanUpObj(message),
            ':blimtm': composeKeys(botParams.botId, message.creationTimestamp, message.id),
            ':chan': message.channel,
            ':botId': botParams.botId,
            ':cd': channelData,
            ...(message.senderIsBot ? {} : {
                ':senderNameSet': aws.dynamoCreateSet([message.senderName]),
                ':senderIdSet': aws.dynamoCreateSet([message.senderId]),
                ':profilePic': message.senderProfilePic || undefined,
            }),
        },
    });
}

/**
 * updates the users table, creating a new item if necessary.
 */
async function updateUsersTable(
    message: DBMessage, botParams: BotParams,
) {
    reportDebug('updateUsersTable');

    await aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_USERS,
        Key: {
            publisherId: botParams.publisherId,
            botId_channel_userId: composeKeys(botParams.botId, message.channel, message.senderId),
        },
        UpdateExpression: 'SET userLastMessage = :userLastMessage' +
                          ', prefs = if_not_exists(prefs, :defaultPrefs)' +
                          ', userRole = if_not_exists(userRole, :defaultUserRole)',
        ExpressionAttributeValues: {
            ':userLastMessage': aws.dynamoCleanUpObj(message),
            ':defaultUserRole': 'user',
            ':defaultPrefs': {},
        },
    });
}

async function handleWebhookMessage(
    rawMessage: WebhookMessage,
    botParams: BotParams,
    respondFn: RespondFn,
    channelData?: ChannelData
) {
    reportDebug('handleWebhookMessage');

    // create DBMessage from WebhookMessage
    const attachments = await processAttachments(rawMessage, botParams);
    let dbMessage = webhookMessageToDBMessage(rawMessage);
    dbMessage = attachments
        ? await insertAttachmentsIntoMessage(dbMessage, attachments)
        : dbMessage;

    reportDebug('dbMessage: ', dbMessage);


    // set up
    const [, conversationId] = decomposeKeys(dbMessage.publisherId_conversationId);
    let newRespondFn;
    const sendAsUser = (msg: DBMessage) => _functionQueue_.enqueue(() => {
        return handleProcessedDBMessage(
            msg, botParams, newRespondFn, conversationId, channelData
        );
    });
    const responses = [];
    newRespondFn = respondFn;
    newRespondFn = respondFnSignS3UrlsMiddleware(newRespondFn);
    newRespondFn = respondFnCollectorMiddleware(newRespondFn, responses);
    newRespondFn = respondFnPreprocessorActionsMiddleware(
        newRespondFn, botParams, conversationId, dbMessage.channel, sendAsUser
    );

    // Ensure the message is not already processed
    // and the sender is allowed to chat
    const [alreadyInDB, user] = await Promise.all([
        isMessageInDB(dbMessage),
        aws.getUserByUserId(botParams.publisherId, botParams.botId,
                            dbMessage.channel, dbMessage.senderId),
    ]);
    if (alreadyInDB) {
        reportDebug(`Message is already in the db. It won't be processed.`);
        return;
    }
    if (!botParams.onlyAllowedUsersCanChat || user && user.userRole !== 'none' && user.isVerified) {
        reportDebug('point 1');
        // Process message, will connect to wit etc.
        await sendAsUser(dbMessage);
        reportDebug('point 1.1');

    } else {
        await Promise.all([
            verifyUser(botParams, dbMessage, newRespondFn, user),
            updateConversationTable(dbMessage, botParams, channelData),
            logMessage(dbMessage),
        ]);
    }

    reportDebug('point 2');

    // log responses and update conversations table
    if (responses.length > 0) {
        const responsesAsDBMessages = responses.map(
            x => createDBMessageFromResponseMessage(x, botParams, conversationId, dbMessage.channel)
        );

        await waitForAll([
            logMessage(responsesAsDBMessages),
            updateConversationTable(_.last(responsesAsDBMessages), botParams, channelData),
        ]);
    }
}

async function handleProcessedDBMessage(
    dbMessage: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn,
    conversationId: string,
    channelData?: ChannelData,
) {
    await Promise.all([
        updateConversationTable(dbMessage, botParams, channelData),
        updateUsersTable(dbMessage, botParams),
        logMessage(dbMessage),
    ]);
    dbMessage = await pollMiddleware(dbMessage, botParams, respondFn);
    if (botParams.settings.witAccessToken) {
        await witAI(dbMessage, botParams, respondFn);
    } else {
        await customAI(dbMessage, botParams, respondFn);
    }
}

export async function deepiksBot(message: WebhookMessage,
                                 botParams: BotParams,
                                 respondFn: RespondFn,
                                 channelData?: ChannelData)
{
    reportDebug('deepiksBot');
    try {
        await handleWebhookMessage(message, botParams, respondFn, channelData);
    } catch(error) {
        const [, conversationId] = decomposeKeys(message.publisherId_conversationId);

        const m = textToResponseMessage((tr[botParams.defaultLanguage] || tr[langs[0]]).errors.general);
        // don't await, let them fail silently
        respondFn(m);
        logResponseMessage(m, botParams, conversationId, message.channel);

        throw error;
    }
}

// this is used when sending a message from a bot to a user
// that is not a direct response to the user's message.
// E.g. feeds, notifications, delayed messages etc.
export async function coldSend(message: ResponseMessage, botParams: BotParams,
                               conversation: Conversation, respondFn: RespondFn)
{
    const [, conversationId] = decomposeKeys(conversation.botId_conversationId);
    let newRespondFn;
    const sendAsUser = (msg: DBMessage) => _functionQueue_.enqueue(() => {
        return handleProcessedDBMessage(
            msg, botParams, newRespondFn, conversationId, conversation.channelData
        );
    });
    const responses = [];
    newRespondFn = respondFn;
    newRespondFn = respondFnSignS3UrlsMiddleware(newRespondFn);
    newRespondFn = respondFnCollectorMiddleware(newRespondFn, responses);
    newRespondFn = respondFnPreprocessorActionsMiddleware(
        newRespondFn, botParams, conversationId,
        conversation.channel, sendAsUser
    );

    await newRespondFn(message);
    await logResponseMessage(responses, botParams, conversationId, conversation.channel);
}

// exports for testing
export {
    logMessage as _logMessage,
    isMessageInDB as _isMessageInDB,
    uploadToS3 as _uploadToS3,
    updateConversationTable as _updateConversationTable,
    updateUsersTable as _updateUsersTable,
    processAttachments as _processAttachments,
    verifyUser as _verifyUser,
};
