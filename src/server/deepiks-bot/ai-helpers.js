/* @flow */

import * as aws from '../../aws/aws.js';
import { CONSTANTS, request } from '../server-utils.js';
import { toStr } from '../../misc/utils.js';
import uuid from 'node-uuid';
const reportDebug = require('debug')('deepiks:ai-helpers');
const reportError = require('debug')('deepiks:ai-helpers:error');
import type { DBMessage, BotParams, ActionRequest, UserPrefs } from '../../misc/types.js';

export type ActionRequestIncomplete = {
    sessionId: string,
    context: Object,
    userPrefs: UserPrefs,
    text: string,
    publisherId: string,
    botId: string,
    entities?: Object,
};

function generateS3PolicyForAction(publisherId: string, botId: string, senderId: string): string {
    return JSON.stringify({
        Version: '2012-10-17',
        Statement: [
            {
                Effect: 'Allow',
                Action: [
                    's3:GetObject',
                    's3:PutObject',
                ],
                Resource: [
                    `arn:aws:s3:::${CONSTANTS.S3_BUCKET_NAME}/${publisherId}/${botId}/${senderId}/*`,
                ]
            }
        ]
    });
}

export async function runAction(
    actionName: string,
    actionRequest: ActionRequestIncomplete,
    originalMessage: DBMessage,
    botParams: BotParams,
    localActions: {[key: string]: Function}
) {
    reportDebug('runAction ', actionName, toStr(actionRequest));
    const { publisherId, botId } = botParams;
    const { senderId } = originalMessage;
    if (!senderId) {
        throw new Error(`ERROR: runAction senderId: ${senderId || ''}`);
    }
    const federationToken = await aws.stsGetFederationToken({
        Name: uuid.v4().substr(0, 30),
        DurationSeconds: 15 * 60,
        Policy: generateS3PolicyForAction(publisherId, botId, senderId),
    });
    const credentials = federationToken.Credentials;
    reportDebug('got federationToken: ', federationToken);
    const requestData: ActionRequest = {
        ...actionRequest,
        // action: actionName,
        credentials: {
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
            expiration: credentials.Expiration,
        },
        s3: {
            bucket: CONSTANTS.S3_BUCKET_NAME,
            prefix: `${publisherId}/${botId}/${senderId}/`,
        }
    };
    if (localActions[actionName]) {
        return await localActions[actionName](requestData);
    }

    const action = await aws.getAIAction(actionName);
    reportDebug('runAction: ', action);
    if (action.url) {
        const res = await request({
            uri: action.url,
            method: 'POST',
            json: true,
            body: requestData,
        });

        if (res.statusCode === 200) {
            reportDebug('runAction url, returned: ', toStr(res.body));
            return res.body;
        } else {
            throw new Error(`runAction url, returned error code ${res.statusCode}`
                + ` and body: ${JSON.stringify(res.body)}`);
        }
    }
    else if (action.lambda){
        const { lambda } = action;
        const res = await aws.lambdaInvoke({
            FunctionName: lambda,
            Payload: JSON.stringify(requestData),
        });
        reportDebug('lambda returned: ', toStr(res));
        if (res.StatusCode !== 200) {
            throw new Error(`lambda ${lambda} returned status code ${res.StatusCode}`);
        }
        const resPayload = JSON.parse(res.Payload);
        if (!resPayload.context){
            throw new Error(`lambda ai action named ${lambda} did not return a context: ` +
                toStr(resPayload));
        }
        return resPayload;
    }

    throw new Error(`Unknown action: ${toStr(action)}`);
}

