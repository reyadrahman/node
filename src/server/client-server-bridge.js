/* @flow */

import { ENV } from './server-utils.js';
import * as aws from '../aws/aws.js';
import uuid from 'node-uuid';
import type { Request, Response } from 'express';
import express from 'express';

const { AWS_REGION, USER_POOL_ID, IDENTITY_POOL_ID, DB_TABLE_BOTS,
        DB_TABLE_CONVERSATIONS, DB_TABLE_MESSAGES } = ENV;

const routes = express.Router();


// function parseJwtIdToken(jwtIdTokenRaw) {
//     try {
//         var idToken = jwtDecode(jwtIdTokenRaw);
//     } catch(err) { }
//
//     if (idToken && idToken.sub) {
//         return idToken;
//     }
//     throw new Error('invalid jwtIdTokenRaw: ', jwtIdTokenRaw);
// }

routes.use('/', (req, res, next) => {
    let jwtIdTokenRaw;
    if (req.query.jwtIdToken) {
        jwtIdTokenRaw = decodeURIComponent(req.query.jwtIdToken);
    } else if (req.body && req.body.jwtIdToken) {
        jwtIdTokenRaw = req.body.jwtIdToken;
    }
    if (jwtIdTokenRaw) {
        let idTokenPayload;
        try {
            idTokenPayload = aws.verifyJwt(jwtIdTokenRaw);
        } catch(error) {
            console.error('Error verifying JWT: ', error);
            return res.status(403).send('Invalid JWT');
        }
        aws.getIdFromJwtIdToken(jwtIdTokenRaw)
            .then(identityId => {
                req.customData = {
                    jwtIdTokenRaw,
                    idTokenPayload,
                    identityId,
                };
                next();
            })
            .catch(next);

    } else {
        next();
    }
});

routes.get('/fetch-bots', (req, res, next) => {
    console.log('bbbbb');
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const { identityId } = req.customData;
    fetchBots(identityId)
        .then(x => res.send(x))
        .catch(err => next(err));

});

routes.get('/fetch-conversations', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const { identityId } = req.customData;
    fetchConversations(identityId)
        .then(x => res.send(x))
        .catch(err => next(err));

});

routes.get('/fetch-messages', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const { identityId } = req.customData;
    fetchMessages(identityId, req.query.conversationId)
        .then(x => res.send(x))
        .catch(err => next(err));

});

routes.post('/add-bot', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const { identityId } = req.customData;
    addBot(identityId, req.body.botName, req.body.settings)
        .then(x => res.send(x))
        .catch(err => next(err));
});


async function fetchBots(identityId) {
    console.log('fetchBots: ', identityId);
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_BOTS,
        KeyConditionExpression: 'publisherId = :pid',
        ExpressionAttributeValues: {
            ':pid': identityId,
        },
    });
    console.log('qres: ', qres);
    return qres.Items || [];
}

async function fetchConversations(identityId) {
    console.log('fetchConversations: ', identityId);
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_CONVERSATIONS,
        IndexName: 'byLastMessageTimestamp',
        KeyConditionExpression: 'publisherId = :pid',
        ExpressionAttributeValues: {
            ':pid': identityId,
        },
        Limit: 50,
        ScanIndexForward: false,
    });

    console.log('qres: ', qres);
    return qres.Items || [];
}

async function fetchMessages(identityId, conversationId) {
    console.log('fetchMessages: ', identityId);
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_MESSAGES,
        KeyConditionExpression: 'publisherId_conversationId = :pc',
        ExpressionAttributeValues: {
            ':pc': aws.composeKeys(identityId, conversationId),
        },
    });

    console.log('qres: ', qres);
    return qres.Items || [];
}

async function addBot(identityId, botName, settings) {
    console.log('addBot: ', identityId, botName, settings);
    const botId = uuid.v1();
    await aws.dynamoPut({
        TableName: DB_TABLE_BOTS,
        Item: aws.dynamoCleanUpObj({
            publisherId: identityId,
            botId,
            botName,
            settings,
        })
    });
}


export default routes;
