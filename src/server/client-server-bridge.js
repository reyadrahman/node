/* @flow */

import { CONSTANTS, request } from './server-utils.js';
import * as aws from '../aws/aws.js';
import * as channels from './channels/all-channels.js';
import type { ContactFormData, FeedConfig } from '../misc/types.js';
import { composeKeys, decomposeKeys } from '../misc/utils.js';

import uuid from 'node-uuid';
import type { Request, Response } from 'express';
import express from 'express';
import ciscospark from 'ciscospark';

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

function authMiddleware(req, res, next) {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }

    next();
}

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

routes.get('/fetch-users', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const { identityId } = req.customData;
    fetchUsers(identityId, req.query.botId)
        .then(x => res.send(x))
        .catch(err => next(err));

});

routes.get('/fetch-polls', authMiddleware, (req, res, next) => {
    fetchPolls(req.customData.identityId, req.query.botId)
        .then(x => res.send(x))
        .catch(err => next(err));
});

routes.get('/fetch-user', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    const {identityId} = req.customData;
    fetchUser(identityId, req.query.botId, req.query.userId)
        .then(x => res.send(x))
        .catch(err => next(err));

});

routes.post('/save-user', (req, res, next) => {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    saveUser(req.customData.identityId, req.body.botId_userId, req.body.model)
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

routes.post('/update-bot', authMiddleware, (req, res, next) => {
    updateBot(req.customData.identityId, req.body.botId, req.body.settings)
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
                CONSTANTS.CONTACT_EMAIL,
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
        Source: CONSTANTS.CONTACT_EMAIL,
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
        TableName: CONSTANTS.DB_TABLE_BOTS,
        KeyConditionExpression: 'publisherId = :pid',
        ExpressionAttributeValues: {
            ':pid': identityId,
        },
    });
    console.log('qres: ', qres);
    return qres.Items || [];
}

async function fetchUsers(identityId, botId) {
    console.log('fetchUsers: identityId=', identityId, 'botId=', botId);
    const qres = await aws.dynamoQuery({
        TableName:                 CONSTANTS.DB_TABLE_USER_PREFS,
        KeyConditionExpression:    'publisherId = :pid AND begins_with(botId_userId, :bid)',
        // FilterExpression:          botId ? 'begins_with(botId_userId, :bid)' : undefined,
        ExpressionAttributeValues: {
            ':pid': identityId,
            ':bid': botId,
        },
        ScanIndexForward:          false,
    });

    return qres.Items || [];
}

async function fetchPolls(identityId, botId) {
    console.log('fetchPolls: identityId=', identityId, 'botId=', botId);
    const qres = await aws.dynamoQuery({
        TableName:                 CONSTANTS.DB_TABLE_POLL_QUESTIONS,
        KeyConditionExpression:    'publisherId = :pid AND begins_with(botId_pollId_questionId, :bid)',
        ExpressionAttributeValues: {
            ':pid': identityId,
            ':bid': botId,
        },
        ScanIndexForward:          false,
    });

    return qres.Items || [];
}

async function fetchUser(identityId, botId, userId) {
    console.log('fetchUsers: identityId=', identityId, 'botId=', botId);
    const qres = await aws.dynamoQuery({
        TableName:                 CONSTANTS.DB_TABLE_USER_PREFS,
        KeyConditionExpression:    'publisherId = :pid AND botId_userId = :pk',
        ExpressionAttributeValues: {
            ':pid': identityId,
            ':pk':  composeKeys(botId, userId)
        },
        Limit:                     1,
        ScanIndexForward:          false,
    });

    return qres.Items && qres.Items[0] || null;
}

async function saveUser(identityId, botId_userId, model) {
    if (botId_userId) {
        let user =  await aws.dynamoUpdate({
            TableName:                 CONSTANTS.DB_TABLE_USER_PREFS,
            Key:                       {
                publisherId: identityId,
                             botId_userId
            },
            UpdateExpression:          'set category = :category, channel = :channel',
            ExpressionAttributeValues: {
                ':category': model.category || null,
                ':channel':  model.channel || null
            },
            ReturnValues:              'ALL_NEW'
        });
        return user.Attributes;
    } else {
        if (!model.id) {
            throw new Error('User id must be present');
        }
        await aws.dynamoPut({
            TableName:    CONSTANTS.DB_TABLE_USER_PREFS,
            Item:         {
                publisherId:  identityId,
                botId_userId: composeKeys(model.botId, model.id),
                category:     model.category || null,
                channel:      model.channel || null
            }
        });

        return fetchUser(identityId, model.botId, model.id);
    }
}

async function fetchConversations(identityId, botId) {
    console.log('fetchConversations: identityId=', identityId, 'botId=', botId);
    // TODO paging
    // see dynamoAccumulatePages in aws-helper.js
    const qres = await aws.dynamoQuery({
        TableName:                 CONSTANTS.DB_TABLE_CONVERSATIONS,
        IndexName:                 'byLastInteractiveMessage',
        KeyConditionExpression:    'publisherId = :pid and ' +
            'begins_with(botId_lastInteractiveMessageTimestamp_messageId, :bid)',
        ExpressionAttributeValues: {
            ':pid': identityId,
            ':bid': botId,
        },
        // Limit: 50,
        ScanIndexForward:          false,
    });

    return qres.Items || [];
}

async function fetchMessages(identityId, conversationId) {
    console.log('fetchMessages: ', identityId);
    const qres = await aws.dynamoQuery({
        TableName: CONSTANTS.DB_TABLE_MESSAGES,
        KeyConditionExpression: 'publisherId_conversationId = :pc',
        ExpressionAttributeValues: {
            ':pc': composeKeys(identityId, conversationId),
        },
    });

    // console.log('qres: ', qres);
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
        targetUrl: `${CONSTANTS.OWN_BASE_URL}/webhooks/${identityId}/${botId}/spark`,
        resource: 'all',
        event: 'all',
        secret: ciscosparkWebhookSecret,
    });
    const me = await csClient.people.get('me');

    await aws.dynamoPut({
        TableName: CONSTANTS.DB_TABLE_BOTS,
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

async function updateBot(identityId, botId, model) {
    console.log('updateBot: ', identityId, botId, model);

    let bot = await aws.dynamoUpdate({
        TableName:                 CONSTANTS.DB_TABLE_BOTS,
        Key:                       {publisherId: identityId, botId},
        UpdateExpression:          `set botName = :botName, 
                                        botIcon = :botIcon, 
                                        enableUsersFilter = :enableUsersFilter, 
                                        settings = :settings`,
        ExpressionAttributeValues: {
            ':botName':           model.botName || null,
            ':botIcon':           model.botIcon || null,
            ':enableUsersFilter': model.enableUsersFilter || false,
            ':settings':          model.settings
        },
        ReturnValues:              'ALL_NEW'
    });
    return bot.Attributes;
}

async function addBotFeed(identityId, botId: string, feedConfig: FeedConfig) {
    const feedConfigWithId = {
        ...feedConfig,
        feedId: uuid.v1(),
    };
    await aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_BOTS,
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
    if (!botParams) {
        throw new Error(`Did not find bot with publisherId ${identityId} and botId ${botId}`);
    }
    const msg = {
        ...message,
        creationTimestamp: Date.now(),
    };
    await channels.sendToMany(botParams, msg, categories);
}

export default routes;
