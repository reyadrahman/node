/* @flow */

import detectImageLabels from './image-label-detection.js';
import * as aws from '../lib/aws.js';
import { callbackToPromise, request, ENV } from '../lib/util.js';
import findSimilarImages from './similar-image-search.js';
import ai from './ai.js';
import type { DBMessage, WebhookMessage, ResponseMessage } from '../lib/types.js';
import URL from 'url';
import gm from 'gm';

const { DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS, S3_BUCKET_NAME } = ENV;

type RespondFn = (response: ResponseMessage) => void;

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
                const item: DBMessage = {
                    publisherId_conversationId: x.publisherId_conversationId,
                    creationTimestamp: x.creationTimestamp,
                    id: x.id,
                    senderId: x.senderId,
                    source: x.source,
                    text: x.text === '' ? undefined : x.text,
                    files: x.files,
                };
                return {
                    PutRequest: {
                        Item: item,
                    }
                };
            })
        }
    });
    console.log('_logMessage end');

}

export async function _uploadToS3(key: string, buffer: Buffer) {
    console.log('_uploadToS3: key: ', key);

    const res = await aws.s3Upload({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
    });
    console.log(`Location: ${res.Location}`)
    return res.Location;
}

async function _fileRoute(message: WebhookMessage, respondFn: RespondFn) {
    respondFn('Detecting keywords, one moment please...');
    console.log('fileRoute');

    let downloads: Array<Buffer> = [];
    if (message.files) {
        const rawDownloads = await Promise.all(message.files.map(
            file => request({
                url: URL.parse(file),
                encoding: null,
            })
        ));
        downloads = rawDownloads.map(x => x.body);
    } else if (message.filesGetFn) {
        downloads = await Promise.all(message.filesGetFn.map(f => f()));
    }

    const s3LocationsP = Promise.all(downloads.map((buffer, i) => {
        const [pid, cid] = aws.decomposeKeys(message.publisherId_conversationId);
        const mid = message.id;
        return _uploadToS3(`${pid}/${cid}/${mid}_${i}`, buffer)
    }));

    const labelSrcData = downloads[downloads.length-1];

    const gmStream = gm(labelSrcData).resize(1000, 1000, '>');
    const smallImage = await callbackToPromise(gmStream.toBuffer, gmStream)('jpg');
    const imageLabelsP = detectImageLabels(smallImage);

    const [s3Files, lastImageLabels] = await Promise.all([s3LocationsP, imageLabelsP]);

    const responseText = 'Keywords for this image are: ' +
    lastImageLabels.map(x => x.label).join(', ');

    console.log('responseText!: ', responseText);
    console.log('creationTimestamp: ', message.creationTimestamp + 1);

    await _logMessage([
        Object.assign({}, message, { files: s3Files }),
        {
            publisherId_conversationId: message.publisherId_conversationId,
            creationTimestamp: message.creationTimestamp + 1, // must be unique
            text: responseText,
        }
    ]);

    respondFn(responseText + '\n\nWould you like to see existing similar images?');
}

export async function _findSimilarRoute(message: WebhookMessage, respondFn: RespondFn) {
    respondFn('Finding similar images, one moment please...');
    await _logWebhookMessage(message);

    let nextTimestamp = message.creationTimestamp + 1; //must be unique
    console.log('nextTimestamp: ', nextTimestamp);

    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_MESSAGES,
        // IndexName: 'Index',
        KeyConditionExpression: 'publisherId_conversationId = :pc and #t < :t',
        ExpressionAttributeValues: {
            ':pc': message.publisherId_conversationId,
            ':t': nextTimestamp++,
        },
        ExpressionAttributeNames: {
            '#t': 'timestamp',
        },
        ScanIndexForward: false,
        Limit: 10,
    });

    const lastMessageWithFile = qres.Items.find(x => x.files);
    console.log('lastMessageWithFile : ', lastMessageWithFile);
    if (!lastMessageWithFile) {
        const responseText = 'No image was posted recently';
        await _logMessage({
            publisherId_conversationId: message.publisherId_conversationId,
            creationTimestamp: nextTimestamp++, // must be unique
            text: responseText,
        });
        return respondFn(responseText);
    }

    const fileUrl = lastMessageWithFile.files[lastMessageWithFile.files.length-1];

    let similarImagesResponse = await findSimilarImages(fileUrl);
    if (!similarImagesResponse.successful) {
        const responseText = 'Unfortunately there was an error while trying to find similar images.';
        await _logMessage({
            publisherId_conversationId: message.publisherId_conversationId,
            creationTimestamp: nextTimestamp++, // must be unique
            text: responseText,
        });
        return respondFn(responseText);
    }
    if (similarImagesResponse.fake) {
        respondFn('(these results are fake, just for development purposes)');
    }

    const similarImages = similarImagesResponse.results;
    if (similarImages.length === 0) {
        const responseText = 'Did not find any similar images';
        await _logMessage({
            publisherId_conversationId: message.publisherId_conversationId,
            creationTimestamp: nextTimestamp++, // must be unique
            text: responseText,
        });
        return respondFn(responseText);

    }

    await _logMessage({
        publisherId_conversationId: message.publisherId_conversationId,
        creationTimestamp: nextTimestamp++, // must be unique
        files: similarImages,
    });

    respondFn({
        text: '',
        files: similarImages,
    });
}

export async function _aiRoute(message: WebhookMessage,
                               respondFn: RespondFn)
{
    console.log('_aiRoute...');
    await _logWebhookMessage(message);
    let nextTimestamp = message.creationTimestamp + 1;

    const responses = []
    await ai(message, m => {
        respondFn(m);
        responses.push(m);
    });
    await _logMessage(responses.map((m, i) => ({
        publisherId_conversationId: message.publisherId_conversationId,
        creationTimestamp: nextTimestamp++, // must be unique
        text: m,
    })));
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

export async function _route(message: WebhookMessage, respondFn: RespondFn) {
    console.log('route');

    await _updateConversationTable(message);

    if (message.text) {
        return await _aiRoute(message, respondFn);
    } else {
        return;
    }

    // TODO merge ai with fileRoute

    //
    // if (message.files && message.files.length > 0 ||
    //     message.filesGetFn && message.filesGetFn.length > 0)
    // {
    //     return await _fileRoute(message, respondFn);
    // }
    //
    //
    // const command = message.text && message.text.toLowerCase().trim();
    // if (command && command.match(/^yes$/)) {
    //     return await _findSimilarRoute(message, respondFn);
    // }
    //
    // return await _textMessageRoute(message, respondFn);
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
