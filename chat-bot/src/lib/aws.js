/* @flow */

import AWS from 'aws-sdk';
import { callbackToPromise, ENV } from './util.js';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
        DB_TABLE_BOTS, DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS,
        S3_BUCKET_NAME } = ENV;


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


export async function getBotById(botId: string): Promise<BotParams> {
    const qres = await dynamoQuery({
        TableName: DB_TABLE_BOTS,
        IndexName: 'botIdIndex',
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

export function composeKeys(a: string, b: string): string {
    return `${a}__${b}`;
}

export function decomposeKeys(k: string): Array<string> {
    return k.split('__');
}

export async function initResources(readCapacityUnits: number, writeCapacityUnits: number) {

    const promises = [
        initResourcesDB(readCapacityUnits, writeCapacityUnits),
        initResourcesS3(),
    ];

    await Promise.all(promises);
}

async function initResourcesDB(readCapacityUnits: number, writeCapacityUnits: number) {
    const { TableNames: tables } = await dynamoListTables({});

    const creatingTables = [];
    if (!tables.includes(DB_TABLE_BOTS)) {
        console.log('creating table: ', DB_TABLE_BOTS);
        const tableParams = {
            TableName : DB_TABLE_BOTS,
            KeySchema: [
                { AttributeName: 'publisherId', KeyType: 'HASH'},
                { AttributeName: 'botId', KeyType: 'RANGE'},
            ],
            AttributeDefinitions: [
                { AttributeName: 'publisherId', AttributeType: 'S' },
                { AttributeName: 'botId', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: readCapacityUnits,
                WriteCapacityUnits: writeCapacityUnits,
            },
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'botIdIndex',
                    KeySchema: [
                        {
                            AttributeName: 'botId',
                            KeyType: 'HASH',
                        },
                    ],
                    Projection: {
                        ProjectionType: 'ALL',
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: readCapacityUnits,
                        WriteCapacityUnits: writeCapacityUnits,
                    },
                },
            ],
        };
        const res = await dynamoCreateTable(tableParams);
        creatingTables.push(DB_TABLE_BOTS);
    }
    if (!tables.includes(DB_TABLE_CONVERSATIONS)) {
        console.log('creating table: ', DB_TABLE_CONVERSATIONS);
        const tableParams = {
            TableName : DB_TABLE_CONVERSATIONS,
            KeySchema: [
                { AttributeName: 'publisherId', KeyType: 'HASH'},
                { AttributeName: 'conversationId', KeyType: 'RANGE'},
                // { AttributeName: "title", KeyType: "RANGE" }
            ],
            AttributeDefinitions: [
                { AttributeName: 'publisherId', AttributeType: 'S' },
                { AttributeName: 'conversationId', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: readCapacityUnits,
                WriteCapacityUnits: writeCapacityUnits,
            }
        };
        const res = await dynamoCreateTable(tableParams);
        creatingTables.push(DB_TABLE_CONVERSATIONS);
    }
    if (!tables.includes(DB_TABLE_MESSAGES)) {
        console.log('creating table: ', DB_TABLE_MESSAGES);
        const tableParams = {
            TableName : DB_TABLE_MESSAGES,
            KeySchema: [
                { AttributeName: 'publisherId_conversationId', KeyType: 'HASH'},
                { AttributeName: 'creationTimestamp', KeyType: 'RANGE' }
            ],
            AttributeDefinitions: [
                { AttributeName: 'publisherId_conversationId', AttributeType: 'S' },
                { AttributeName: 'creationTimestamp', AttributeType: 'N' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: readCapacityUnits,
                WriteCapacityUnits: writeCapacityUnits,
            }
        };
        const res = await dynamoCreateTable(tableParams);
        creatingTables.push(DB_TABLE_MESSAGES);
    }

    await Promise.all(creatingTables.map(
        x => dynamoWaitFor('tableExists', { TableName: x })
    ));
    console.log('All DynamoDB tables are ready');
}

function createS3Policy(bucketName) {
    // TODO allow publishers to get/put/list their directories
    return (
`{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*"
		}
	]
}`
);
}

async function initResourcesS3() {
    const { Buckets: buckets } = await s3ListBuckets();
    const bucketNames = buckets.map(x => x.Name);

    if (!bucketNames.includes(S3_BUCKET_NAME)) {
        console.log('creating s3 bucket ', S3_BUCKET_NAME);
        await s3CreateBucket({
            Bucket: S3_BUCKET_NAME,
        });
        await s3PutBucketPolicy({
            Bucket: S3_BUCKET_NAME,
            Policy: createS3Policy(S3_BUCKET_NAME),
        })
        await s3WaitFor('bucketExists', {
            Bucket: S3_BUCKET_NAME,
        });
    }
    console.log('All S3 buckets ready');
}
