/* @flow */

import * as aws from '../../aws/aws.js';
import { callbackToPromise, toStr, destructureS3Url } from '../../misc/utils.js';
import { request, ENV } from '../server-utils.js';
import aiRoute from './ai.js';
import type { DBMessage, WebhookMessage, ResponseMessage, BotParams,
              ChannelData, Conversation, RespondFn } from '../../misc/types.js';
import URL from 'url';
import gm from 'gm';
import _ from 'lodash';
import uuid from 'uuid';

const { DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS, S3_BUCKET_NAME, DB_TABLE_SCHEDULED_TASKS } = ENV;

type ProcessedAttachment = {
    urlP: Promise<string>,
    buffer: Buffer,
    format: string,
};

export async function _isMessageInDB(message: WebhookMessage) {
    console.log('_isMessageInDB');
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_MESSAGES,
        // IndexName: 'Index',
        KeyConditionExpression: 'publisherId_conversationId = :pc and creationTimestamp = :t',
        ExpressionAttributeValues: {
            ':pc': message.publisherId_conversationId,
            ':t': message.creationTimestamp,
        },
    });
    return qres.Count > 0;
}

export async function _logResponseMessage(ms: ResponseMessage | Array<ResponseMessage>,
                                          botParams: BotParams, conversationId: string,
                                          channel: string)
{
    const messages = Array.isArray(ms)
        ? ms : [ms];

    await _logMessage(messages.map(m => ({
        publisherId_conversationId: aws.composeKeys(botParams.publisherId, conversationId),
        senderId: aws.composeKeys(botParams.publisherId, botParams.botId),
        senderName: botParams.botName,
        channel: channel,
        senderIsBot: true,
        id: uuid.v1(),
        ...m,
    })));
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
                [DB_TABLE_MESSAGES]: chunk.map(x => {
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
    publisherId: string,
    botId: string,
    conversationId: string
): RespondFn
{
    return async function(response) {
        const pas = response.preprocessorActions;
        if (!pas || pas.length === 0) {
            next(response);
            return;
        }

        const delayAction = pas.find(x => x.action === 'delay' && Number(x.args[0]));
        if (delayAction) {
            // remove the action and schedule it
            const newResponse = {
                ...response,
                preprocessorActions: pas.filter(x => x.action !== 'delay'),
            }
            const scheduleTimestamp = Date.now() + Number(delayAction.args[0]) * 1000 * 60;
            await aws.dynamoPut({
                TableName: DB_TABLE_SCHEDULED_TASKS,
                Item: {
                    dummy: '.',
                    scheduleTimestamp_taskId: aws.composeKeys(scheduleTimestamp, uuid.v1()),
                    publisherId: publisherId,
                    botId,
                    conversationId,
                    message: newResponse,
                    type: 'message',
                }
            });
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
            if (!bucketAndKey || bucketAndKey.bucket !== S3_BUCKET_NAME) {
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
        Bucket: S3_BUCKET_NAME,
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

export async function _attachmentMiddleware(message: WebhookMessage):
    Promise<?Array<ProcessedAttachment>>
{
    console.log('_attachmentMiddleware');
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
        const [pid] = aws.decomposeKeys(message.publisherId_conversationId);
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

export async function _surveyRoute(
    message: DBMessage,
    botParams: BotParams,
    respondFn: RespondFn
): Promise<void>
{
    // TODO
    // const lastMessage = await _getLastMessageByUserInConversation(processedMessage.publisherId_conversationId);

}

/**
 * updates the conversation table, creating a new item if necessary
 */
export async function _updateConversationTable(message: DBMessage,
                                               botParams: BotParams,
                                               channelData?: ChannelData)
{
    console.log('_updateConversationTable');
    const [publisherId, conversationId] = aws.decomposeKeys(message.publisherId_conversationId);

    const res = await aws.dynamoUpdate({
        TableName: DB_TABLE_CONVERSATIONS,
        Key: {
            publisherId,
            conversationId,
        },
        UpdateExpression: 'SET lastMessage = :lastMessage, lastMessageTimestamp = :lmt, channel = :chan, botId = :botId ' +
            (channelData ? ', channelData = :cd' : 'REMOVE channelData'),
        ExpressionAttributeValues: {
            ':lastMessage': aws.dynamoCleanUpObj(message),
            ':lmt': message.creationTimestamp,
            ':chan': message.channel,
            ':botId': botParams.botId,
            ':cd': channelData,
        },
    });
    console.log('_updateConversationTable res: ', res);
}

export async function _route(rawMessage: WebhookMessage,
                             botParams: BotParams,
                             respondFn: RespondFn,
                             channelData?: ChannelData)
{
    console.log('route');

    const attachments = await _attachmentMiddleware(rawMessage);
    const dbMessage = _webhookMessageToDBMessage(rawMessage);
    const processedMessage = attachments
        ? await _insertAttachmentsIntoMessage(dbMessage, attachments)
        : dbMessage;
    const [, conversationId] = aws.decomposeKeys(processedMessage.publisherId_conversationId);

    console.log('processedMessage: ', processedMessage);

    // will await later
    const updateConversationP = _updateConversationTable(processedMessage, botParams, channelData);
    const logP = _logMessage(processedMessage);

    await updateConversationP;
    await logP;

    const responses = [];
    respondFn = _respondFnCollectorMiddleware(respondFn, responses);
    respondFn = _respondFnPreprocessorActionsMiddleware(
        respondFn, botParams.publisherId, botParams.botId, conversationId);
    respondFn = _respondFnSignS3UrlsMiddleware(respondFn);

    // try to process the message as a survey,
    // if unsuccessful, then pass it to wit.ai
    const wasSurvey = await _surveyRoute(processedMessage, botParams, respondFn);
    if (!wasSurvey) {
        await aiRoute(processedMessage, botParams, respondFn);
    }

    await _logResponseMessage(responses, botParams, conversationId, processedMessage.channel);
}


export async function deepiksBot(message: WebhookMessage,
                                 botParams: BotParams,
                                 respondFn: RespondFn,
                                 channelData?: ChannelData)
{
    console.log('deepiksBot');
    try {
        if (await _isMessageInDB(message)) {
            console.log(`Message is already in the db. It won't be processed.`)
            return;
        }
        await _route(message, botParams, respondFn, channelData);
    } catch(error) {
        const [, conversationId] = aws.decomposeKeys(message.publisherId_conversationId);
        const m = { text: 'Sorry, there seems to be a problem...' };
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
    const responses = [];
    respondFn = _respondFnCollectorMiddleware(respondFn, responses);
    respondFn = _respondFnPreprocessorActionsMiddleware(
        respondFn, botParams.publisherId, botParams.botId, conversation.conversationId);
    respondFn = _respondFnSignS3UrlsMiddleware(respondFn);

    await respondFn(message);
    await _logResponseMessage(responses, botParams, conversation.conversationId, conversation.channel);
}

export default deepiksBot;