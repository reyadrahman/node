/* @flow */

import * as aws from '../lib/aws.js';
import { callbackToPromise, request, ENV } from '../lib/util.js';
import ai from './ai.js';
import type { DBMessage, WebhookMessage, ResponseMessage } from '../lib/types.js';
import URL from 'url';
import gm from 'gm';
import _ from 'lodash';

const { DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS, S3_BUCKET_NAME } = ENV;

type RespondFn = (response: ResponseMessage) => void;
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

export async function _logWebhookMessage(ms: WebhookMessage | Array<WebhookMessage>) {
    await _logMessage((ms: any));
}
export async function _logMessage(ms: DBMessage | Array<DBMessage>) {
    const messages = Array.isArray(ms)
        ? ms : [ms];
    console.log('_logMessage: ', messages);
    if (messages.length === 0) return;

    await aws.dynamoBatchWrite({
        RequestItems: {
            [DB_TABLE_MESSAGES]: messages.map(x => {
                return {
                    PutRequest: {
                        Item: _.pickBy(x, a=>!!a),
                    }
                };
            })
        }
    });
    console.log('_logMessage end');

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
    const { files, filesGetFn } = message;

    if (!files && !filesGetFn) {
        return null;
    }

    let downloads: Array<Buffer> = [];
    if (files) {
        const startTime = Date.now();
        const rawDownloads = await Promise.all(files.map(
            file => request({
                url: URL.parse(file),
                encoding: null,
            })
        ));
        console.log('PROFILING: raw download time: %s ms', Date.now() - startTime);
        downloads = rawDownloads.map(x => x.body);
    } else if (filesGetFn) {
        const startTime = Date.now();
        downloads = await Promise.all(filesGetFn.map(f => f()));
        console.log('PROFILING: raw download time: %s ms', Date.now() - startTime);
    }
    const formats = await Promise.all(downloads.map(_getFileFormat));

    const s3LocationAndFormatPs = _.zip(downloads, formats).map(([buffer, format], i) => {
        const [pid, cid] = aws.decomposeKeys(message.publisherId_conversationId);
        const mid = message.id;
        const extension = format ? '.' + format : '';
        return {
            urlP: _uploadToS3(`${pid}/${cid}/${mid}_${i}${extension}`, buffer),
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
    const { filesGetFn, ...rest } = message;
    return _.pickBy(rest, x=>!!x);
}

export async function _insertAttachmentsIntoMessage(
    message: DBMessage,
    attachments: Array<ProcessedAttachment>
): Promise<DBMessage> {

    const newMessage = { ...message };
    newMessage.files = await Promise.all(attachments.map(a => a.urlP));
    return newMessage;
}

// export async function _findSimilarRoute(message: WebhookMessage, respondFn: RespondFn) {
//     respondFn('Finding similar images, one moment please...');
//     await _logWebhookMessage(message);
//
//     let nextTimestamp = message.creationTimestamp + 1; //must be unique
//     console.log('nextTimestamp: ', nextTimestamp);
//
//     const qres = await aws.dynamoQuery({
//         TableName: DB_TABLE_MESSAGES,
//         // IndexName: 'Index',
//         KeyConditionExpression: 'publisherId_conversationId = :pc and #t < :t',
//         ExpressionAttributeValues: {
//             ':pc': message.publisherId_conversationId,
//             ':t': nextTimestamp++,
//         },
//         ExpressionAttributeNames: {
//             '#t': 'timestamp',
//         },
//         ScanIndexForward: false,
//         Limit: 10,
//     });
//
//     const lastMessageWithFile = qres.Items.find(x => x.files);
//     console.log('lastMessageWithFile : ', lastMessageWithFile);
//     if (!lastMessageWithFile) {
//         const responseText = 'No image was posted recently';
//         await _logMessage({
//             publisherId_conversationId: message.publisherId_conversationId,
//             creationTimestamp: nextTimestamp++, // must be unique
//             text: responseText,
//         });
//         return respondFn(responseText);
//     }
//
//     const fileUrl = lastMessageWithFile.files[lastMessageWithFile.files.length-1];
//
//     let similarImagesResponse = await findSimilarImages(fileUrl);
//     if (!similarImagesResponse.successful) {
//         const responseText = 'Unfortunately there was an error while trying to find similar images.';
//         await _logMessage({
//             publisherId_conversationId: message.publisherId_conversationId,
//             creationTimestamp: nextTimestamp++, // must be unique
//             text: responseText,
//         });
//         return respondFn(responseText);
//     }
//     if (similarImagesResponse.fake) {
//         respondFn('(these results are fake, just for development purposes)');
//     }
//
//     const similarImages = similarImagesResponse.results;
//     if (similarImages.length === 0) {
//         const responseText = 'Did not find any similar images';
//         await _logMessage({
//             publisherId_conversationId: message.publisherId_conversationId,
//             creationTimestamp: nextTimestamp++, // must be unique
//             text: responseText,
//         });
//         return respondFn(responseText);
//
//     }
//
//     await _logMessage({
//         publisherId_conversationId: message.publisherId_conversationId,
//         creationTimestamp: nextTimestamp++, // must be unique
//         files: similarImages,
//     });
//
//     respondFn({
//         text: '',
//         files: similarImages,
//     });
// }

export async function _aiRoute(
    message: DBMessage,
    respondFn: RespondFn
): Promise<Array<ResponseMessage>>
{
    console.log('_aiRoute...');

    const responses = []
    await ai(message, m => {
        respondFn(m);
        responses.push(m);
    });
    return responses;
}

async function _textMessageRoute(message: WebhookMessage, respondFn: RespondFn) {
    await _logWebhookMessage(message);
}

export async function _updateConversationTable(message: WebhookMessage)
{
    console.log('_updateConversationTable');
    const [publisherId, conversationId] = aws.decomposeKeys(message.publisherId_conversationId);
    // TODO use DynamoDoc.update instead
    try {
        const res = await aws.dynamoPut({
            TableName: DB_TABLE_CONVERSATIONS,
            Item: {
                publisherId,
                conversationId,
            },
            ConditionExpression: 'attribute_not_exists(publisherId)',
        });
        console.log('_updateConversationTable res: ', res);
    } catch(err) {
        if (err.code !== 'ConditionalCheckFailedException') {
            throw err;
        }
    }
}

export async function _route(rawMessage: WebhookMessage, respondFn: RespondFn) {
    console.log('route');

    // will await later
    const updateConversationP = _updateConversationTable(rawMessage);

    // [{urlP, buffer, format}]
    const attachments = await _attachmentMiddleware(rawMessage);

    const dbMessage = _webhookMessageToDBMessage(rawMessage);
    const processedMessage = attachments
        ? await _insertAttachmentsIntoMessage(dbMessage, attachments)
        : dbMessage;

    console.log('processedMessage: ', processedMessage);
    // will await later
    const logP = _logMessage(processedMessage);

    await updateConversationP;

    const aiRouteResponses = await _aiRoute(processedMessage, respondFn);

    await logP;

    let nextTimestamp = processedMessage.creationTimestamp + 1;
    await _logMessage(aiRouteResponses.map(m => ({
        publisherId_conversationId: processedMessage.publisherId_conversationId,
        creationTimestamp: nextTimestamp++, // must be unique
        ...(typeof m === 'string' ? {text: m} : m),
    })));
}


export default async function deepiksBot(message: WebhookMessage,
                                         respondFn: RespondFn)
{
    console.log('deepiksBot');
    if (await _isMessageInDB(message)) {
        console.log(`Message is already in the db. It won't be processed.`)
        return;
    }
    await _route(message, respondFn);
};
