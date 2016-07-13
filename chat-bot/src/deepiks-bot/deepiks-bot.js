import detectImageLabels from './image-label-detection.js';
import * as aws from '../lib/aws.js';
import { callbackToPromise, request } from '../lib/util.js';
import URL from 'url';
// const gm = require('gm').subClass({imageMagick: true});
import gm from 'gm';

const { DB_TABLE_NAME, S3_BUCKET_NAME } = process.env;


async function isMessageInDB(message) {
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_NAME,
        // IndexName: 'Index',
        KeyConditionExpression: 'roomId = :roomId and #t = :t',
        ExpressionAttributeValues: {
            ':roomId': message.roomId,
            ':t': new Date(message.created).getTime(),
        },
        ExpressionAttributeNames: {
            '#t': 'timestamp',
        },
    });
    return qres.Count > 0;

}

async function logMessage(messageOrMessages) {
    const messages = Array.isArray(messageOrMessages)
        ? messageOrMessages : [messageOrMessages];
    console.log('logMessage: ', messageOrMessages);

    await aws.dynamoBatchWrite({
        RequestItems: {
            [DB_TABLE_NAME]: messages.map(x => ({
                PutRequest: {
                    Item: {
                        roomId: x.roomId,
                        timestamp: new Date(x.created).getTime(),
                        messageId: x.id,
                        personId: x.personId,
                        personEmail: x.personEmail,
                        source: x.sourceBot,
                        text: x.text || null,
                        files: x.files,
                    },
                }
            }))
        }
    });
    console.log('logMessage end');

}

async function uploadToS3(key, buffer) {
    console.log('uploadToS3: key: ', key);

    const res = await aws.s3Upload({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
    });
    console.log(`Location: ${res.Location}`)
    return res.Location;
}

async function _fileRoute(message, respondFn) {
    respondFn('Detecting keywords, one moment please...');
    console.log('fileRoute');

    let downloads;
    if (message.files) {
        const rawDownloads = await Promise.all(message.files.map(
            file => request({
                url: URL.parse(file),
                // TODO use message.filesGetFn instead
                headers: {
                    Authorization: message.filesDownloadAuth || '',
                },
                encoding: null,
            })
        ));
        downloads = rawDownloads.map(x => x.body);
    } else { // message.filesGetFn
        downloads = await Promise.all(message.filesGetFn.map(f => f()));
    }

    const s3LocationsP = Promise.all(downloads.map((buffer, i) => {
        return uploadToS3(`${message.roomId}/${message.id}_${i}`, buffer)
    }));

    const labelSrcData = downloads[downloads.length-1];

    const gmStream = gm(labelSrcData).resize(1000, 1000, '>');
    const smallImage = await callbackToPromise(gmStream.toBuffer, gmStream)('jpg');
    const imageLabelsP = detectImageLabels(smallImage);

    const [s3Files, lastImageLabels] = await Promise.all([s3LocationsP, imageLabelsP]);

    const responseText = 'Keywords for this image are: ' +
    lastImageLabels.map(x => x.label).join(', ');

    console.log('responseText!: ', responseText);
    console.log('created: ', new Date(message.created).getTime() + 1);

    await logMessage([
        Object.assign({}, message, { files: s3Files }),
        {
            roomId: message.roomId,
            created: new Date(message.created).getTime() + 1, // must be unique
            text: responseText,
        }
    ]);

    respondFn(responseText + '\n\nWould you like to see existing similar images?');
}

export async function _findSimilarRoute(message, respondFn) {
    respondFn('Finding similar images, one moment please...');
    await logMessage(message);

    const timestamp = new Date(message.created).getTime();
    console.log('timestamp: ', timestamp);

    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_NAME,
        // IndexName: 'Index',
        KeyConditionExpression: 'roomId = :roomId and #t < :t',
        ExpressionAttributeValues: {
            ':roomId': message.roomId,
            ':t': timestamp,
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
        await logMessage({
            roomId: message.roomId,
            created: timestamp + 1, // must be unique
            text: responseText,
        });
        return respondFn(responseText);
    }

    const fileUrl = lastMessageWithFile.files[lastMessageWithFile.files.length-1];

    let similarImagesRes;
    try {
        similarImagesRes = await request({
            url: URL.parse(`http://52.205.71.12:9000/s3files?img=${fileUrl}`)
        });
    } catch (err) {
        console.error(err);
    }
    if (!similarImagesRes || similarImagesRes.statusCode !== 200) {
        const responseText = 'Unfortunately there was an error while trying to find similar images.';
        await logMessage({
            roomId: message.roomId,
            created: timestamp + 1, // must be unique
            text: responseText,
        });
        return respondFn(responseText);
    }

    const similarImages = JSON.parse(similarImagesRes.body).results;
    if (similarImages.length === 0) {
        const responseText = 'Did not find any similar images';
        await logMessage({
            roomId: message.roomId,
            created: timestamp + 1, // must be unique
            text: responseText,
        });
        return respondFn(responseText);

    }

    await logMessage({
        roomId: message.roomId,
        created: timestamp + 1, // must be unique
        // text: '',
        files: similarImages,
    });

    respondFn({
        text: '',
        files: similarImages,
    });
}

async function _textMessageRoute(message, respondFn) {
    await logMessage(message);
}

async function _route(message, respondFn) {
    console.log('route');
    if (message.files && message.files.length > 0 ||
        message.filesGetFn && message.filesGetFn.length > 0)
    {
        return await _fileRoute(message, respondFn);
    }

    const command = message.text && message.text.toLowerCase().trim();
    if (command && command.match(/^yes$/)) {
        return await _findSimilarRoute(message, respondFn);
    }

    return await _textMessageRoute(message, respondFn);
}


export default async function deepiksBot(message, respondFn) {
    if (await isMessageInDB(message)) {
        console.log(`Message is already in the db. It won't be processed.`)
        return;
    }
    await _route(message, respondFn);
};
