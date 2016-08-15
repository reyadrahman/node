/* @flow */

import { ENV } from './server-utils.js';
import * as aws from '../aws/aws.js';
import uuid from 'node-uuid';
import type { Request, Response } from 'express';
import express from 'express';
// TODO use express-jwt
import jwtDecode from 'jwt-decode';

const { AWS_REGION, USER_POOL_ID, IDENTITY_POOL_ID, DB_TABLE_BOTS,
        DB_TABLE_CONVERSATIONS, DB_TABLE_MESSAGES } = ENV;

const routes = express.Router();


// TODO verify publisherId claim
function parseJwtIdToken(jwtIdToken) {
    try {
        var idToken = jwtDecode(jwtIdToken);
    } catch(err) { }

    if (idToken && idToken.sub) {
        return idToken;
    }
    throw new Error('invalid jwtIdToken: ', jwtIdToken);
}

routes.use('/', (req, res, next) => {
    let jwtIdToken;
    if (req.query.jwtIdToken) {
        jwtIdToken = decodeURIComponent(req.query.jwtIdToken);
    } else if (req.body && req.body.jwtIdToken) {
        jwtIdToken = req.body.jwtIdToken;
    }
    if (jwtIdToken) {
        let idToken = parseJwtIdToken(jwtIdToken);
        aws.getIdFromJwtIdToken(jwtIdToken)
            .then(identityId => {
                req.customData = {
                    jwtIdToken,
                    idToken,
                    identityId,
                };
                next();
            })
            .catch(next);
    }
});

// TODO validate input
routes.get('/fetch-bots', (req, res, next) => {
    const { idToken, identityId } = req.customData;
    fetchBots(identityId, idToken)
        .then(x => res.send(x))
        .catch(err => next(err));

});

// TODO validate input
routes.get('/fetch-conversations', (req, res, next) => {
    const { idToken, identityId } = req.customData;
    fetchConversations(identityId, idToken)
        .then(x => res.send(x))
        .catch(err => next(err));

});

// TODO validate input
routes.get('/fetch-messages', (req, res, next) => {
    const { idToken, identityId } = req.customData;
    fetchMessages(identityId, idToken, req.query.conversationId)
        .then(x => res.send(x))
        .catch(err => next(err));

});

// TODO validate input
routes.post('/add-bot', (req, res, next) => {
    const { idToken, identityId } = req.customData;
    addBot(identityId, idToken, req.body.botName, req.body.settings)
        .then(x => res.send(x))
        .catch(err => next(err));
});


async function fetchBots(identityId, idToken) {
    console.log('fetchBots: ', idToken);
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

async function fetchConversations(identityId, idToken) {
    console.log('fetchConversations: ', idToken);
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

async function fetchMessages(identityId, idToken, conversationId) {
    console.log('fetchMessages: ', idToken);
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

async function addBot(identityId, idToken, botName, settings) {
    console.log('addBot: ', idToken, botName, settings);
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
