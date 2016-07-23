/* @flow */

import AWS from 'aws-sdk';
import { callbackToPromise, ENV } from './util.js';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
        DB_TABLE_BOTS } = ENV;


export type BotParams = {
    botId: string,
    publisherId: string,
    settings: {
        ciscosparkAccessToken: string,
        messengerPageAccessToken: string,
        microsoftAppId: string,
        microsoftAppPassword: string,
        ciscosparkBotEmail: string,
    },
};

AWS.config.update({
    apiVersions: {
        dynamodb: '2012-08-10',
        s3: '2006-03-01',
        lambda: '2015-03-31',
    },
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

const dynamoDoc = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

export const dynamoBatchWrite = callbackToPromise(dynamoDoc.batchWrite, dynamoDoc);
export const dynamoPut = callbackToPromise(dynamoDoc.put, dynamoDoc);
export const dynamoQuery = callbackToPromise(dynamoDoc.query, dynamoDoc);
export const s3PutObject = callbackToPromise(s3.putObject, s3);
export const s3Upload = callbackToPromise(s3.upload, s3);


export async function getBotById(botId: string): Promise<BotParams> {
    const qres = await dynamoQuery({
        TableName: DB_TABLE_BOTS,
        KeyConditionExpression: 'botId = :botId',
        ExpressionAttributeValues: {
            ':botId': botId,
        },
    });
    if (qres.Count === 0) {
        throw new Error(`Cannot find bot with id ${botId}`);
    }

    return qres.Items[0];
}
