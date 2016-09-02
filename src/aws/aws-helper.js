console.log('======== AWS SERVER');

/* @flow */

// server uses 'aws-sdk'. Client uses 'external_modules/aws-sdk.min.js'
import AWS from 'aws-sdk';
import { callbackToPromise } from '../misc/utils.js';
import { ENV, CONSTANTS, request } from '../server/server-utils.js';
import type { BotParams, AIActionInfo } from '../misc/types.js';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
        DB_TABLE_BOTS, DB_TABLE_MESSAGES, DB_TABLE_CONVERSATIONS,
        DB_TABLE_AI_ACTIONS, DB_TABLE_USER_PREFS, S3_BUCKET_NAME,
        IDENTITY_POOL_ID, USER_POOL_ID} = ENV;

// this is used to verify signatures for user pool's JWT
var _userPoolPems_;

AWS.config.update({
    apiVersions: {
        dynamodb: '2012-08-10',
        s3: '2006-03-01',
        lambda: '2015-03-31',
        sts: '2011-06-15',
        cognitoidentity: '2014-06-30',
        cognitosync: '2014-06-30',
    },
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

const dynamoDoc = new AWS.DynamoDB.DocumentClient();
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const lambda = new AWS.Lambda();
const cognitoIdentity = new AWS.CognitoIdentity();
const sts = new AWS.STS();
const ses = new AWS.SES();

export const dynamoBatchWrite = callbackToPromise(dynamoDoc.batchWrite, dynamoDoc);
export const dynamoPut = callbackToPromise(dynamoDoc.put, dynamoDoc);
export const dynamoUpdate = callbackToPromise(dynamoDoc.update, dynamoDoc);
export const dynamoQuery = callbackToPromise(dynamoDoc.query, dynamoDoc);
export const dynamoScan = callbackToPromise(dynamoDoc.scan, dynamoDoc);
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
export const s3PutBucketCors = callbackToPromise(s3.putBucketCors, s3);
export const s3GetSignedUrl = callbackToPromise(s3.getSignedUrl, s3);
export const lambdaInvoke = callbackToPromise(lambda.invoke, lambda);
export const cognitoIdentityGetId = callbackToPromise(cognitoIdentity.getId, cognitoIdentity);
export const stsGetFederationToken = callbackToPromise(sts.getFederationToken, sts);
export const sendEmail = callbackToPromise(ses.sendEmail, ses);

export function dynamoCleanUpObj(obj: Object) {
    return _.reduce(obj, (acc, v, k) => {
        let newV = v;
        if (_.isPlainObject(newV)) {
            newV = dynamoCleanUpObj(newV);
        }
        if (!_.isNil(newV) && newV !== '') {
            acc[k] = newV;
        }
        return acc;
    }, {});
}

export async function getBot(publisherId: string, botId: string): Promise<BotParams> {
    const qres = await dynamoQuery({
        TableName: DB_TABLE_BOTS,
        KeyConditionExpression: 'publisherId = :publisherId and botId = :botId',
        ExpressionAttributeValues: {
            ':publisherId': publisherId,
            ':botId': botId,
        },
    });
    if (qres.Count === 0) {
        throw new Error(`Cannot find bot with id ${botId}`);
    }

    return qres.Items[0];
}

export async function getIdFromJwtIdToken(jwtIdToken: string): string {
    const res = await cognitoIdentityGetId({
        IdentityPoolId: IDENTITY_POOL_ID,
        Logins: {
            [`cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`]: jwtIdToken
        }
    });
    return res.IdentityId;
}

// verifies and returns token's payload
// throws errors
export function verifyJwt(token: string) {
    console.log('verifyJwt');
    const decoded = jwt.decode(token, {complete: true});
    if (!decoded) {
        throw new Error(`verifyJwt: Could not decode JWT: ${token}`);
    }
    console.log('verifyJwt decoded: ', decoded);
    const iss = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;

    if (decoded.payload.iss !== iss) {
        throw new Error(`verifyJwt: Invalid issuer: ${decoded.payload.iss}`);
    }

    if (decoded.payload.token_use !== 'id') {
        throw new Error(`verifyJwt: Invalid token_use ${decoded.payload.token_use}`);
    }

    const pem = _userPoolPems_[decoded.header.kid];
    if (!pem) {
        throw new Error(`verifyJwt: Could not find pem for kid: ${decoded.header.kid}`);
    }

    const payload = jwt.verify(token, pem, { issuer: iss });
    console.log('verifyJwt: successfully verified');
}

export const getAIAction = _createGetAIAction();

export function _createGetAIAction() {
    let cache;
    let lastCacheTimestamp = 0;

    return async function getAIActionHelper(actionName: string): Promise<AIActionInfo> {
        const dt = (Date.now() - lastCacheTimestamp)/1000;
        if (cache && dt < CONSTANTS.AI_ACTION_CACHE_VALID_TIME_S && cache[actionName]) {
            console.log('getAIActionHelper: returning from cache');
            return cache[actionName];
        }
        console.log('getAIActionHelper: making DB request');

        const qres = await dynamoScan({
            TableName: DB_TABLE_AI_ACTIONS,
        });

        cache = _.fromPairs(qres.Items.map(x => [x.action, x]));
        console.log('new cache: ', cache);
        lastCacheTimestamp = Date.now();

        if (!cache[actionName]) {
            throw new Error(`Coudn't find action named ${actionName}`);
        }

        return cache[actionName]
    }
}

export function composeKeys(a: string, b: string): string {
    return `${a}__${b}`;
}

export function decomposeKeys(k: string): Array<string> {
    const split = k.split('__');
    return [split[0], split.slice(1).join('__')];
}

/*
    readCapacityUnits and writeCapacityUnits are used for DynamoDB tables. But not all of them.
    For example DB_TABLE_AI_ACTIONS may choose (1, 1) because it uses caching, reducing the need to
    read.
 */
export async function initResources(readCapacityUnits: number, writeCapacityUnits: number) {

    const promises = [
        initResourcesDB(readCapacityUnits, writeCapacityUnits),
        initResourcesS3(),
        initResourcesUserPoolJwt(),
    ];

    await Promise.all(promises);
}

async function initResourcesDB(readCapacityUnits: number, writeCapacityUnits: number) {
    const { TableNames: tables } = await dynamoListTables({});

    const creatingTables = [];
    if (!tables.includes(DB_TABLE_BOTS)) {
        console.log('creating table: DB_TABLE_BOTS');
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
        };
        const res = await dynamoCreateTable(tableParams);
        creatingTables.push(DB_TABLE_BOTS);
    }
    if (!tables.includes(DB_TABLE_CONVERSATIONS)) {
        console.log('creating table: DB_TABLE_CONVERSATIONS');
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
                { AttributeName: 'lastMessageTimestamp', AttributeType: 'N' },
            ],
            LocalSecondaryIndexes: [
                {
                    IndexName: 'byLastMessageTimestamp',
                    KeySchema: [
                        { AttributeName: 'publisherId', KeyType: 'HASH'},
                        { AttributeName: 'lastMessageTimestamp', KeyType: 'RANGE'},
                    ],
                    Projection: {
                        ProjectionType: 'ALL',
                    },
                },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: readCapacityUnits,
                WriteCapacityUnits: writeCapacityUnits,
            },
        };
        const res = await dynamoCreateTable(tableParams);
        creatingTables.push(DB_TABLE_CONVERSATIONS);
    }
    if (!tables.includes(DB_TABLE_MESSAGES)) {
        console.log('creating table: DB_TABLE_MESSAGES');
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
    if (!tables.includes(DB_TABLE_AI_ACTIONS)) {
        console.log('creating table: DB_TABLE_AI_ACTIONS');
        const tableParams = {
            TableName : DB_TABLE_AI_ACTIONS,
            KeySchema: [
                { AttributeName: 'action', KeyType: 'HASH'},
            ],
            AttributeDefinitions: [
                { AttributeName: 'action', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            }
        };
        const res = await dynamoCreateTable(tableParams);
        creatingTables.push(DB_TABLE_AI_ACTIONS);
    }
    if (!tables.includes(DB_TABLE_USER_PREFS)) {
        console.log('creating table: DB_TABLE_USER_PREFS');
        const tableParams = {
            TableName : DB_TABLE_USER_PREFS,
            KeySchema: [
                { AttributeName: 'publisherId', KeyType: 'HASH' },
                { AttributeName: 'botId_userId', KeyType: 'RANGE' }
            ],
            AttributeDefinitions: [
                { AttributeName: 'publisherId', AttributeType: 'S' },
                { AttributeName: 'botId_userId', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: readCapacityUnits,
                WriteCapacityUnits: writeCapacityUnits,
            }
        };
        const res = await dynamoCreateTable(tableParams);
        creatingTables.push(DB_TABLE_USER_PREFS);
    }

    await Promise.all(creatingTables.map(
        x => dynamoWaitFor('tableExists', { TableName: x })
    ));
    console.log('All DynamoDB tables are ready');
}

async function initResourcesS3() {
    const { Buckets: buckets } = await s3ListBuckets();
    const bucketNames = buckets.map(x => x.Name);

    if (!bucketNames.includes(S3_BUCKET_NAME)) {
        console.log('creating s3 bucket ', S3_BUCKET_NAME);
        await s3CreateBucket({
            Bucket: S3_BUCKET_NAME,
        });
        // await s3PutBucketPolicy({
        //     Bucket: S3_BUCKET_NAME,
        //     Policy: createS3Policy(S3_BUCKET_NAME),
        // })
        await s3PutBucketCors({
            Bucket: S3_BUCKET_NAME,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedMethods: [ 'GET', 'POST', 'PUT' ],
                        AllowedOrigins: [ '*' ],
                        AllowedHeaders: [ '*' ],
                        MaxAgeSeconds: 3000
                    },
                ]
            },
        })
        await s3WaitFor('bucketExists', {
            Bucket: S3_BUCKET_NAME,
        });
    }
    console.log('All S3 buckets ready');
}


// sets _userPoolJwtByKid_
async function initResourcesUserPoolJwt() {
    const req = await request({
        uri: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
        json: true,
    });
    const userPoolJwtByKid = _.keyBy(req.body.keys, 'kid');
    // console.log('_userPoolJwtByKid_: ', _userPoolJwtByKid_);

    _userPoolPems_ = _.mapValues(userPoolJwtByKid,
        x => jwkToPem(_.pick(x, ['kty', 'n', 'e']))
    );

    console.log('_userPoolPems_: ', _userPoolPems_);
}
