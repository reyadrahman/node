/* @flow */

import AWS from 'aws-sdk';
import { callbackToPromise, ENV } from './util.js';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
        DB_TABLE_BOTS, DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS,
        S3_BUCKET_NAME } = ENV;

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
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();

export const dynamoBatchWrite = callbackToPromise(dynamoDoc.batchWrite, dynamoDoc);
export const dynamoPut = callbackToPromise(dynamoDoc.put, dynamoDoc);
export const dynamoQuery = callbackToPromise(dynamoDoc.query, dynamoDoc);
export const dynamoCreateTable = callbackToPromise(dynamodb.createTable, dynamodb);
export const dynamoDeleteTable = callbackToPromise(dynamodb.deleteTable, dynamodb);
export const dynamoListTables = callbackToPromise(dynamodb.listTables, dynamodb);
export const dynamoWaitFor = callbackToPromise(dynamodb.waitFor, dynamodb);
export const s3PutObject = callbackToPromise(s3.putObject, s3);
export const s3GetObject = callbackToPromise(s3.getObject, s3);
export const s3Upload = callbackToPromise(s3.upload, s3);
export const s3ListBuckets = callbackToPromise(s3.listBuckets, s3);
export const s3CreateBucket = callbackToPromise(s3.createBucket, s3);
export const s3WaitFor = callbackToPromise(s3.waitFor, s3);
export const s3PutBucketPolicy = callbackToPromise(s3.putBucketPolicy, s3);


export function composeKeys(a: string, b: string): string {
    return `${a}__${b}`;
}

export function decomposeKeys(k: string): Array<string> {
    return k.split('__');
}
