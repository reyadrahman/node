/* @flow */

import { ENV } from './server-utils.js';
import * as aws from '../aws/aws.js';
import uuid from 'node-uuid';
import type { Request, Response } from 'express';
import express from 'express';
// TODO use express-jwt
import jwtDecode from 'jwt-decode';

const { DB_TABLE_BOTS } = ENV;

const routes = express.Router();

// TODO verify publisherId claim
routes.get('/get-bots', (req, res, next) => {

});

// TODO verify publisherId claim
//      validate input
routes.post('/add-bot', (req, res, next) => {
    // console.log('add-bot route: body: ', req.body);
    try {
        var idToken = jwtDecode(req.body.jwtIdToken);
    } catch(err) { }
    if (!idToken || !idToken.sub) {
        return next(new Error('invalid jwtIdToken: ', req.body.jwtIdToken));
    }

    addBot(idToken, req.body.botName, req.body.settings)
        .then(x => res.send(x))
        .catch(err => next(err));
});


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
