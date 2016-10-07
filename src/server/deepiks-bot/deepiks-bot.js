/* @flow */

import * as aws from '../../aws/aws.js';
import { callbackToPromise, toStr, destructureS3Url, timeout,
         composeKeys, decomposeKeys, waitForAll } from '../../misc/utils.js';
import { request, CONSTANTS } from '../server-utils.js';
import aiRoute from './ai.js';
import type { DBMessage, WebhookMessage, ResponseMessage, BotParams,
              ChannelData, Conversation, RespondFn } from '../../misc/types.js';
import URL from 'url';
import gm from 'gm';
import _ from 'lodash';
import uuid from 'uuid';

type ProcessedAttachment = {
    urlP: Promise<string>,
    buffer: Buffer,
    format: string,
};

export async function _isMessageInDB(message: WebhookMessage) {
    console.log('_isMessageInDB');
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

export async function _isSenderAllowedToChat(botParams: BotParams, message: WebhookMessage) {
    if (!botParams.onlyAllowedUsersCanChat) {
        return true;
    }
    const qres = await aws.getUser(botParams.publisherId, botParams.botId,
                                   message.channel, message.senderId);
    return qres && qres.userRole !== 'none';
}

export function _createDBMessageFromResponseMessage(
    m: ResponseMessage, botParams: BotParams,
    conversationId: string, channel: string
) : DBMessage
{
    if (!m.creationTimestamp) {
        throw new Error(`_createDBMessageFromResponseMessage message is ` +
                        `missing creationTimestamp: ${toStr(m)}`)
    }
    return {
        publisherId_conversationId: composeKeys(botParams.publisherId, conversationId),
        senderId: [botParams.publisherId, botParams.botId].join('::'),
        senderName: botParams.botName,
        channel: channel,
        senderIsBot: true,
        id: uuid.v1(),
        text: m.text,
        cards: m.cards,
        actions: m.actions,
        creationTimestamp: m.creationTimestamp,
        poll: m.poll && {
            pollId: m.poll.pollId,
            questionId: m.poll.questionId,
            isQuestion: true,
        },
    }
}

export async function _logResponseMessage(ms: ResponseMessage | Array<ResponseMessage>,
                                          botParams: BotParams, conversationId: string,
                                          channel: string)
{
    const messages = Array.isArray(ms)
        ? ms : [ms];

    await _logMessage(messages.map(
        x => _createDBMessageFromResponseMessage(x, botParams, conversationId, channel)
    ));
}

export async function _logWebhookMessage(ms: WebhookMessage | Array<WebhookMessage>) {
    await _logMessage((ms: any));
}
export async function _logMessage(ms: DBMessage | Array<DBMessage>) {
    const messages = Array.isArray(ms)
        ? ms : [ms];
    console.log('_logMessage: ', toStr(messages));
    if (messages.length === 0) return;

    // dynamodb batch write limit is 25
    const chunks = _.chunk(messages, 25);
    for (let i=0; i<chunks.length; i++) {
        const chunk = chunks[i];
        await aws.dynamoBatchWrite({
            RequestItems: {
                [CONSTANTS.DB_TABLE_MESSAGES]: chunk.map(x => {
                    return {
                        PutRequest: {
                            Item: aws.dynamoCleanUpObj(x),
                        },
                    };
                })
            }
        });
    }
    console.log('_logMessage end');

}

export function _respondFnPreprocessorActionsMiddleware(
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
        console.log('_respondFnPreprocessorActionsMiddleware self: ', pas);

        const delayAction = pas.find(x => x.action === 'delay' && Number(x.args[0]));
        const pollAction = pas.find(x => x.action === 'poll' && x.args[0] && x.args[1]);
        const asUserAction = pas.find(x => x.action === 'as user');
        const emailAction = pas.find(x => x.action === 'email' && x.args[0]);

        if (delayAction && pollAction) {
            const m = `Cannot use 'delay' and 'poll' preprocessor actions together`;
            console.error(m);
            await next({ text: m, creationTimestamp: Date.now() });
            return;
        }

        if (emailAction && asUserAction) {
            const m = `Cannot user 'email' and 'as user' preprocessor actions together`;
            console.error(m);
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
                    scheduleTimestamp_taskId: composeKeys(scheduleTimestamp, uuid.v1()),
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
            // const qres = await aws.dynamoQuery({
            //     TableName: CONSTANTS.DB_TABLE_MESSAGES,
            //     KeyConditionExpression: 'publisherId_conversationId = :pc',
            //     ExpressionAttributeValues: {
            //         ':pc': composeKeys(botParams.publisherId, conversationId),
            //         ':t': 
            //     },
            // });
        }

        if (asUserAction) {
            console.log('asUserAction: ', response.text);
            const message = _createDBMessageFromResponseMessage({
                text: response.text,
                creationTimestamp: Date.now(),
            }, botParams, conversationId, channel);

            // TODO investigate why the strange behaviours occur without this timeout
            await timeout(3000);
            await sendAsUser(message);
        }

    };
}

export function _respondFnCollectorMiddleware(next: RespondFn, toCollection: ResponseMessage[]): RespondFn {
    return response => {
        toCollection.push(response);
        return next(response);
    }
}

export function _respondFnSignS3UrlsMiddleware(next: RespondFn): RespondFn {
    return async function(response) {
        const newResponse = await _signS3Urls(response)
        await next(newResponse);
    }
}

export async function _signS3Urls(response: ResponseMessage): Promise<ResponseMessage> {
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

export async function _uploadToS3(key: string, buffer: Buffer) {
    const startTime = Date.now();
    console.log('_uploadToS3: key: ', key);

    const res = await aws.s3Upload({
        Bucket: CONSTANTS.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
    });
    console.log('PROFILING: s3 time upload: %s ms', Date.now() - startTime);
    console.log(`Location: ${res.Location}`)
    return res.Location;
}

async function _getFileFormat(buffer: Buffer): Promise<string> {
    const gmImg = gm(buffer);
    const formatFn = callbackToPromise(gmImg.format, gmImg);
    try {
        return (await formatFn()).toLowerCase();
    } catch(err) { }
    return '';
}

export async function _processAttachments(message: WebhookMessage):
    Promise<?Array<ProcessedAttachment>>
{
    console.log('_processAttachments');
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
        console.log('PROFILING: raw download time: %s ms', Date.now() - startTime);
        downloads = rawDownloads.map(x => x.body);
    } else if (fetchCardImages) {
        const startTime = Date.now();
        downloads = await Promise.all(fetchCardImages.map(f => f()));
        console.log('PROFILING: raw download time: %s ms', Date.now() - startTime);
    }
    const formats = await Promise.all(downloads.map(_getFileFormat));

    const s3LocationAndFormatPs = _.zip(downloads, formats).map(([buffer, format], i) => {
        const [pid] = decomposeKeys(message.publisherId_conversationId);
        // const bid = botParams.botId;
        const mid = message.id;
        const sid = message.senderId;
        const t = message.creationTimestamp;
        const extension = format ? '.' + format : '';
        return {
            urlP: _uploadToS3(`${pid}/${sid}/${t}_${i}${extension}`, buffer),
            format,
        };
    });

    return _.zipWith(downloads, s3LocationAndFormatPs, (buffer, { urlP, format }) => ({
        buffer,
        urlP,
        format,
    }));
}

export function _webhookMessageToDBMessage(message: WebhookMessage): DBMessage {
    const { fetchCardImages, ...rest } = message;
    return rest;
}

export async function _insertAttachmentsIntoMessage(
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
export async function _pollMiddleware(
    message: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn
) : Promise<DBMessage>
{
    const lastMessage = await _getLastMessageInConversation(
        message.publisherId_conversationId,
        message.creationTimestamp);
    if (!lastMessage || !lastMessage.poll || !lastMessage.poll.isQuestion) {
        return message;
    }

    const { pollId, questionId } = lastMessage.poll;

    console.log(`_pollMiddleware pollId: ${pollId}, ` +
                `questionId: ${questionId}, ` +
                `answer: ${message.text || ''}`);

    const pollQuestion = await aws.getPollQuestion(botParams.publisherId, botParams.botId, pollId, questionId);
    console.log('_pollMiddleware pollQuestion: ', pollQuestion);
    const pollAnswer = (message.text || '').trim().substr(0, 100).toLowerCase();

    // if (!pollQuestion.validAnswers.find(x => String(x).toLowerCase() === pollAnswer)) {
    //     console.log('_pollMiddleware got ', pollAnswer, ', but expected one of ', pollQuestion.validAnswers);
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

export async function _getLastMessageInConversation(
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
export async function _updateConversationTable(message: DBMessage,
                                               botParams: BotParams,
                                               channelData?: ChannelData)
{
    console.log('_updateConversationTable');
    const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);

    const res = await aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_CONVERSATIONS,
        Key: {
            publisherId,
            botId_conversationId: composeKeys(botParams.botId, conversationId),
        },
        UpdateExpression: 'SET lastMessage = :lastMessage, ' +
                          'botId_lastInteractiveMessageTimestamp_messageId = :blimtm, ' +
                          'channel = :chan, botId = :botId ' +
                          (channelData ? ', channelData = :cd' : 'REMOVE channelData'),
        ExpressionAttributeValues: {
            ':lastMessage': aws.dynamoCleanUpObj(message),
            ':blimtm': composeKeys(botParams.botId, message.creationTimestamp, message.id),
            ':chan': message.channel,
            ':botId': botParams.botId,
            ':cd': channelData,
        },
    });
}

/**
 * updates the users table, creating a new item if necessary.
 * The `message` must be a message from user, not from bot.
 */
export async function _updateUsersTable(message: DBMessage,
                                        botParams: BotParams)
{
    console.log('_updateUsersTable');
    // const [publisherId, conversationId] = decomposeKeys(message.publisherId_conversationId);

    const res = await aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_USERS,
        Key: {
            publisherId: botParams.publisherId,
            botId_channel_userId: composeKeys(botParams.botId, message.channel, message.senderId),
        },
        UpdateExpression: 'SET userLastMessage = :userLastMessage, ' +
                          'userName = :userName, ' +
                          'userRole = if_not_exists(userRole, :defaultRole)',
        ExpressionAttributeValues: {
            ':userLastMessage': aws.dynamoCleanUpObj(message),
            ':userName': message.senderName,
            ':defaultRole': 'user',
        },
    });
}

export async function _handleWebhookMessage(
    rawMessage: WebhookMessage,
    botParams: BotParams,
    respondFn: RespondFn,
    channelData?: ChannelData
) {
    console.log('_handleWebhookMessage');
    const [alreadyInDB, isAllowedToChat] = await Promise.all([
        _isMessageInDB(rawMessage),
        _isSenderAllowedToChat(botParams, rawMessage),
    ]);
    if (alreadyInDB) {
        console.log(`Message is already in the db. It won't be processed.`)
        return;
    }
    if (!isAllowedToChat) {
        await respondFn({ text: `Sorry, I'm not allowed to chat with you. Please contact the publisher.` });
        return;
    }
    // if (await _isMessageInDB(message)) {
    //     console.log(`Message is already in the db. It won't be processed.`)
    //     return;
    // }

    const attachments = await _processAttachments(rawMessage);
    let dbMessage = _webhookMessageToDBMessage(rawMessage);
    dbMessage = attachments
        ? await _insertAttachmentsIntoMessage(dbMessage, attachments)
        : dbMessage;

    console.log('dbMessage: ', dbMessage);

    const [, conversationId] = decomposeKeys(dbMessage.publisherId_conversationId);
    let newRespondFn;
    const sendAsUser = (msg: DBMessage) => _handleProcessedDBMessage(msg, botParams, newRespondFn, conversationId, channelData);

    const responses = [];
    newRespondFn = respondFn;
    newRespondFn = _respondFnSignS3UrlsMiddleware(newRespondFn);
    newRespondFn = _respondFnCollectorMiddleware(newRespondFn, responses);
    newRespondFn = _respondFnPreprocessorActionsMiddleware(
        newRespondFn, botParams, conversationId, dbMessage.channel, sendAsUser
    );

    await sendAsUser(dbMessage);

    if (responses.length > 0) {
        const responsesAsDBMessages = responses.map(
            x => _createDBMessageFromResponseMessage(x, botParams, conversationId, dbMessage.channel)
        );

        await waitForAll([
            _logMessage(responsesAsDBMessages),
            _updateConversationTable(_.last(responsesAsDBMessages), botParams, channelData),
        ]);
    }
}

export async function _handleProcessedDBMessage(
    dbMessage: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn,
    conversationId: string,
    channelData?: ChannelData
) {
    await Promise.all([
        _updateConversationTable(dbMessage, botParams, channelData),
        _updateUsersTable(dbMessage, botParams),
        _logMessage(dbMessage),
    ]);

    dbMessage = await _pollMiddleware(dbMessage, botParams, respondFn);
    await aiRoute(dbMessage, botParams, respondFn);
}

export async function deepiksBot(message: WebhookMessage,
                                 botParams: BotParams,
                                 respondFn: RespondFn,
                                 channelData?: ChannelData)
{
    console.log('deepiksBot');
    try {
        await _handleWebhookMessage(message, botParams, respondFn, channelData);
    } catch(error) {
        const [, conversationId] = decomposeKeys(message.publisherId_conversationId);
        const m = { text: 'Sorry, there seems to be a problem...', creationTimestamp: Date.now() };
        // don't await, let them fail silently
        respondFn(m);
        _logResponseMessage(m, botParams, conversationId, message.channel);

        throw error;
    }
};

// this is used when sending a message from a bot to a user
// that is not a direct response to the user's message.
// E.g. feeds, notifications, delayed messages etc.
export async function coldSend(message: ResponseMessage, botParams: BotParams,
                               conversation: Conversation, respondFn: RespondFn)
{
    const [, conversationId] = decomposeKeys(conversation.botId_conversationId);
    let newRespondFn;
    const sendAsUser = (msg: DBMessage) => _handleProcessedDBMessage(
        msg, botParams, newRespondFn, conversationId, conversation.channelData
    );
    const responses = [];
    newRespondFn = respondFn;
    newRespondFn = _respondFnSignS3UrlsMiddleware(newRespondFn);
    newRespondFn = _respondFnCollectorMiddleware(newRespondFn, responses);
    newRespondFn = _respondFnPreprocessorActionsMiddleware(
        newRespondFn, botParams, conversationId,
        conversation.channel, sendAsUser
    );

    await newRespondFn(message);
    await _logResponseMessage(responses, botParams, conversationId, conversation.channel);
}

export default deepiksBot;