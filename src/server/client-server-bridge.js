/* @flow */

import { ENV } from './server-utils.js';
import * as aws from '../aws/aws.js';
import uuid from 'node-uuid';
import type { Request, Response } from 'express';
import express from 'express';
// TODO use express-jwt
import jwtDecode from 'jwt-decode';

const { DB_TABLE_BOTS, DB_TABLE_CONVERSATIONS, DB_TABLE_MESSAGES } = ENV;

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

// TODO validate input
routes.get('/fetch-bots', (req, res, next) => {
    const idToken = parseJwtIdToken(decodeURIComponent(req.query.jwtIdToken));
    fetchBots(idToken)
        .then(x => res.send(x))
        .catch(err => next(err));

});

// TODO validate input
routes.get('/fetch-conversations', (req, res, next) => {
    const idToken = parseJwtIdToken(decodeURIComponent(req.query.jwtIdToken));
    fetchConversations(idToken)
        .then(x => res.send(x))
        .catch(err => next(err));

});

// TODO validate input
routes.get('/fetch-messages', (req, res, next) => {
    const idToken = parseJwtIdToken(decodeURIComponent(req.query.jwtIdToken));
    fetchMessages(idToken, req.query.conversationId)
        .then(x => res.send(x))
        .catch(err => next(err));

});

// TODO validate input
routes.post('/add-bot', (req, res, next) => {
    const idToken = parseJwtIdToken(req.body.jwtIdToken);
    addBot(idToken, req.body.botName, req.body.settings)
        .then(x => res.send(x))
        .catch(err => next(err));
});


async function fetchBots(idToken) {
    console.log('fetchBots: ', idToken);
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_BOTS,
        KeyConditionExpression: 'publisherId = :pid',
        ExpressionAttributeValues: {
            ':pid': idToken.sub,
        },
    });
    console.log('qres: ', qres);
    return qres.Items || [];
}

async function fetchConversations(idToken) {
    console.log('fetchConversations: ', idToken);
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_CONVERSATIONS,
        KeyConditionExpression: 'publisherId = :pid',
        ExpressionAttributeValues: {
            ':pid': idToken.sub,
        },
    });

    console.log('qres: ', qres);
    return qres.Items || [];
}

async function fetchMessages(idToken, conversationId) {
    console.log('fetchMessages: ', idToken);
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_MESSAGES,
        KeyConditionExpression: 'publisherId_conversationId = :pc',
        ExpressionAttributeValues: {
            ':pc': aws.composeKeys(idToken.sub, conversationId),
        },
    });

    console.log('qres: ', qres);
    return qres.Items || [];
}

async function addBot(idToken, botName, settings) {
    console.log('addBot: ', idToken, botName, settings);
    const botId = uuid.v1();
    await aws.dynamoPut({
        TableName: DB_TABLE_BOTS,
        Item: aws.dynamoCleanUpObj({
            publisherId: idToken.sub,
            botId,
            botName,
            settings,
        })
    });
}


export default routes;
