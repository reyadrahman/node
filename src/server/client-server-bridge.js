/* @flow */

import { ENV, request } from './server-utils.js';
import * as aws from '../aws/aws.js';
import * as channels from './channels/all-channels.js';
import type { ContactFormData, FeedConfig } from '../misc/types.js';

import uuid from 'node-uuid';
import type { Request, Response } from 'express';
import express from 'express';
import ciscospark from 'ciscospark';

const { AWS_REGION, USER_POOL_ID, IDENTITY_POOL_ID, DB_TABLE_BOTS,
        DB_TABLE_CONVERSATIONS, DB_TABLE_MESSAGES, WIZARD_BOT_WEB_CHAT_SECRET,
        CONTACT_EMAIL, OWN_BASE_URL } = ENV;

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

routes.post('/send-email', (req, res, next) => {
    sendEmail(req.body.contactFormData)
        .then(x => res.send(x))
        .catch(err => next(err));
});

routes.get('/fetch-bots', (req, res, next) => {
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
    fetchConversations(identityId, req.query.botId)
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

routes.delete('/remove-bot', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    // TODO: Once the client supports removing bots, remove the bot from the
    //       database, remove messages, conversations and cisco spark webhooks
});

routes.post('/add-bot-feed', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const { identityId } = req.customData;
    addBotFeed(identityId, req.body.botId, req.body.feedConfig)
        .then(x => res.send(x))
        .catch(err => next(err));
});

routes.post('/send-notification', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const { identityId } = req.customData;
    sendNotification(identityId, req.body.botId, req.body.message, req.body.categories)
        .then(x => res.send(x))
        .catch(err => next(err));
});

routes.get('/fetch-web-chat-session-token', (req, res, next) => {
    const { identityId } = req.customData || {};
    fetchWebChatSessionToken(identityId)
        .then(x => res.send(x))
        .catch(err => next(err));
});

async function sendEmail(contactFormData: ContactFormData) {
    let { email, name, subject, message } = contactFormData;
    if (!email) {
        throw new Error('No email provided');
    }

    if (!message) {
        throw new Error('Empty message');
    }

    name = name || email;
    subject = subject || 'Contact';

    const params = {
        Destination: {
            ToAddresses: [
                CONTACT_EMAIL,
            ],
        },
        Message: {
            Body: {
                Text: {
                    Data: message,
                    Charset: 'UTF-8',
                },
            },
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            },
        },
        // TODO
        Source: CONTACT_EMAIL,
        ReplyToAddresses: [
            name + '<' + email + '>',
        ],
    };

    console.log('sendEmail: ', params);
    await aws.sendEmail(params);
}

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

async function fetchConversations(identityId, botId) {
    console.log('fetchConversations: identityId=', identityId, 'botId=', botId);
    const qres = await aws.dynamoQuery({
        TableName:                 DB_TABLE_CONVERSATIONS,
        IndexName:                 'byLastMessageTimestamp',
        KeyConditionExpression:    'publisherId = :pid',
        FilterExpression:          'botId = :bid',
        ExpressionAttributeValues: {
            ':pid': identityId,
            ':bid': botId
        },
        // Limit: 50,
        ScanIndexForward:          false,
    });

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
    const ciscosparkWebhookSecret = uuid.v1();

    // register webhook for cisco spark
    const csClient = ciscospark.init({
        credentials: {
            access_token: settings.ciscosparkAccessToken,
        },
    });
    const webhook = await csClient.webhooks.create({
        name: `deepiks bot (${botName})`,
        targetUrl: `${OWN_BASE_URL}/webhooks/${identityId}/${botId}/spark`,
        resource: 'all',
        event: 'all',
        secret: ciscosparkWebhookSecret,
    });
    const me = await csClient.people.get('me');

    await aws.dynamoPut({
        TableName: DB_TABLE_BOTS,
        Item: aws.dynamoCleanUpObj({
            publisherId: identityId,
            botId,
            botName,
            settings: {
                ...settings,
                ciscosparkWebhookSecret,
                ciscosparkWebhookId: webhook.id,
                ciscosparkBotPersonId: me.id,
            },
        })
    });
}

async function addBotFeed(identityId, botId: string, feedConfig: FeedConfig) {
    const feedConfigWithId = {
        ...feedConfig,
        feedId: uuid.v1(),
    };
    await aws.dynamoUpdate({
        TableName: DB_TABLE_BOTS,
        Key: {
            publisherId: identityId,
            botId,
        },
        UpdateExpression: 'SET feeds = list_append(if_not_exists(feeds, :emptyList), :newFeed)',
        ExpressionAttributeValues: {
            ':emptyList': [],
            ':newFeed': [feedConfigWithId],
        },
    });
}

async function sendNotification(identityId, botId, message, categories) {
    console.log('sendNotification: ', identityId, botId, message);
    const botParams = await aws.getBot(identityId, botId);
    await channels.sendToMany(botParams, message, categories);
}

async function fetchWebChatSessionToken(identityId) {
    console.log('fetchWebChatSessionToken: ', identityId);
    if (identityId) {
        // TODO get token from database if available
        // otherwise get a new one and store in database
    }
    return await fetchWebChatSessionTokenHelper();
}

// returns JSON of token
async function fetchWebChatSessionTokenHelper() {
    const reqData = {
        uri: 'https://webchat.botframework.com/api/tokens',
        headers: {
            Authorization: `BotConnector ${WIZARD_BOT_WEB_CHAT_SECRET}`,
        },
    };
    console.log('reqData: ', reqData);
    const res = await request(reqData);
    if (res.statusCode !== 200) {
        throw new Error(`fetchWebChatSessionTokenHelper failed with status code ` +
                        `${res.statusCode} and status message ${res.statusMessage}`);
    }
    console.log('fetchWebChatSessionToken got token: ', res.body);
    return res.body;
}


export default routes;
