/* @flow */

import { CONSTANTS, request } from './server-utils.js';
import * as aws from '../aws/aws.js';
import * as channels from './channels/all-channels.js';
import type { ContactFormData, FeedConfig } from '../misc/types.js';
import { composeKeys, decomposeKeys, shortLowerCaseRandomId } from '../misc/utils.js';
import { updateFeedsForBot } from './periodic-tasks/feeds-periodic-task.js';
import * as E from '../misc/error-codes.js';

import { inspect } from 'util';
import uuid from 'node-uuid';
import type { Request, Response } from 'express';
import express from 'express';
import ciscospark from 'ciscospark';
import _ from 'lodash';
const reportDebug = require('debug')('deepiks:client-server-bridge');
const reportError = require('debug')('deepiks:client-server-bridge:error');

const routes = express.Router();


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
            reportError('Error verifying JWT: ', error);
            return res.status(403).send('Invalid JWT');
        }
        aws.getIdFromJwtIdToken(jwtIdTokenRaw)
            .then(identityId => {
                req.customData = {
                    ...req.customData,
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

/**
 * Use this instead of directly using `routes.METHOD(...)`
 * sets `req.customData.defaultErrorCode` to `defaultErrorCode`
 * and adds the `awaitMiddleware`
 */
function createRoute(method, path, defaultErrorCode, ...middlewares) {
    routes[method].call(
        routes,
        path,
        (req, res, next) => {
            req.customData = {
                ...req.customData,
                defaultErrorCode,
            };
            next();
        },
        ...middlewares,
        awaitMiddleware,
    );
}

createRoute('post', '/send-email', E.SEND_EMAIL_GENERAL, (req, res, next) => {
    res.locals.resPromise = sendEmail(req.body.contactFormData);
    next();
});

createRoute('get', '/fetch-bots', E.FETCH_BOTS_GENERAL, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = fetchBots(identityId);
    next();
});

createRoute('get', '/fetch-bot-public-info', E.GENERAL_ERROR, (req, res, next) => {
    res.locals.resPromise = fetchBotPublicInfo(req.query.publisherId, req.query.botId);
    next();
});

createRoute('get', '/fetch-users', E.FETCH_USERS_GENERAL, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = fetchUsers(identityId, req.query.botId);
    next();
});

createRoute('get', '/fetch-polls', E.GENERAL_ERROR, authMiddleware, (req, res, next) => {
    res.locals.resPromise = fetchPolls(req.customData.identityId, req.query.botId);
    next();
});

createRoute('get', '/fetch-user', E.FETCH_USER_GENERAL, authMiddleware, (req, res, next) => {
    const {identityId} = req.customData;
    res.locals.resPromise = fetchUser(
        identityId, req.query.botId, req.query.channel, req.query.userId
    );
    next();
});

createRoute('post', '/save-user', E.SAVE_USER_GENERAL, authMiddleware, (req, res, next) => {
    res.locals.resPromise = saveUser(
        req.customData.identityId, req.body.botId, req.body.channel,
        req.body.userId, req.body.email, req.body.userRole
    );
    next();
});

createRoute('get', '/fetch-conversations', E.FETCH_CONVERSATIONS_GENERAL, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = fetchConversations(
        identityId, req.query.botId, req.query.since && parseInt(req.query.since)
    );
    next();
});

createRoute('get', '/fetch-messages', E.FETCH_MESSAGES_GENERAL, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = fetchMessages(
        identityId, req.query.conversationId,
        req.query.since && parseInt(req.query.since)
    );
    next();
});

createRoute('post', '/add-bot', E.ADD_BOT_GENERAL, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = addBot(identityId, req.body.botName, req.body.settings);
    next();
});

createRoute('post', '/update-bot', E.UPDATE_BOT_GENERAL, authMiddleware, (req, res, next) => {
    res.locals.resPromise = updateBot(
        req.customData.identityId, req.body.botId, req.body.settings
    );
    next();
});

createRoute('delete', '/remove-bot', E.GENERAL_ERROR, authMiddleware, (req, res, next) => {
    // TODO: Once the client supports removing bots, remove the bot from the
    //       database, remove messages, conversations and cisco spark webhooks
});

createRoute('post', '/add-bot-feed', E.ADD_BOT_FEED_GENERAL, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = addBotFeed(identityId, req.body.botId, req.body.feedConfig);
    next();
});

createRoute('post', '/force-send-feeds', E.FORCE_SEND_FEEDS_GENERAL, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = forceSendFeeds(identityId, req.body.botId);
    next();
});

createRoute('post', '/send-notification', E.GENERAL_ERROR, authMiddleware, (req, res, next) => {
    const { identityId } = req.customData;
    res.locals.resPromise = sendNotification(
        identityId, req.body.botId, req.body.message, req.body.categories
    );
    next();
});


/**
 * Catch unhandled errors.
 * Must be the last route.
 */
routes.use(errorHandlerMiddleware);


function authMiddleware(req, res, next) {
    if (!req.customData || !req.customData.identityId) {
        return res.status(403).send('Missing JWT');
    }
    next();
}

/**
 * Looks for res.locals.resPromise and if it exists, it returns the resolved value
 * of the promise or the error if it's rejected.
 * The error can optionally have `status` and `code` properties. If it doesn't have
 * the `code` property, it looks for `req.customData.defaultErrorCode`, and if that
 * doesn't exist either, it defaults to `E.GeneralError`
 */
function awaitMiddleware(req, res, next) {
    reportDebug('have res.locals.resPromise? ', !!res.locals.resPromise);
    const p = res.locals.resPromise;
    if (!p) return next();
    if (!(p instanceof Promise)) res.send(p);

    p.then(
        x => res.send(x),
        error => errorHandlerMiddleware(error, req, res, next),
    );
}

function errorHandlerMiddleware(error, req, res, next) {
    const code =
        error.code ||
        (req.customData && req.customData.defaultErrorCode) ||
        E.GeneralError;
    const status = error.status || 500;
    reportError('errorHandlerMiddleware error:', error,
                ', returning status: ', status, ', code: ', code);
    res.status(status).send({ status, code });
}



async function sendEmail(contactFormData: ContactFormData) {
    reportDebug('sendEmail: ', contactFormData);
    let { email, name, subject, message } = contactFormData;
    if (!email) {
        throw { code: E.SEND_EMAIL_NO_EMAIL };
    }

    if (!message) {
        throw { code: E.SEND_EMAIL_NO_MESSAGE };
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
        Source: CONSTANTS.CONTACT_EMAIL,
        ReplyToAddresses: [
            name + '<' + email + '>',
        ],
    };

    reportDebug('sendEmail: ', params);
    await aws.sesSendEmail(params);
}

async function fetchBotPublicInfo(identityId, botId) {
    reportDebug('fetchBotPublicInfo: ', arguments);
    const qres = await aws.dynamoQuery({
        TableName:                 CONSTANTS.DB_TABLE_BOTS,
        KeyConditionExpression:    'publisherId = :pid AND botId = :bid',
        ExpressionAttributeValues: {
            ':pid': identityId,
            ':bid': botId
        },
    });

    if (qres.Items) {
        let bot = qres.Items[0];
        if (bot.isPublic) {
            return {
                botId:       bot.botId,
                publisherId: bot.publisherId,
                botName:     bot.botName,
                botIcon:     bot.botIcon,
                isPublic:    bot.isPublic,
                settings:    {
                    secretWebchatCode: bot.settings.secretWebchatCode
                }
            };
        } else {
            return Promise.reject({
                status:  403,
                message: 'Bot is not public'
            });
        }
    }

    return Promise.reject({
        status:  404,
        message: 'Bot does not exist'
    });
}

async function fetchBots(identityId) {
    reportDebug('fetchBots: ', identityId);
    const qres = await aws.dynamoQuery({
        TableName: CONSTANTS.DB_TABLE_BOTS,
        KeyConditionExpression: 'publisherId = :pid',
        ExpressionAttributeValues: {
            ':pid': identityId,
        },
    });
    reportDebug('qres: ', qres);
    return qres.Items || [];
}

async function fetchUsers(identityId, botId) {
    reportDebug('fetchUsers: identityId=', identityId, 'botId=', botId);
    const qres = await aws.dynamoQuery({
        TableName:                 CONSTANTS.DB_TABLE_USERS,
        KeyConditionExpression:    'publisherId = :pid AND begins_with(botId_channel_userId, :bid)',
        ExpressionAttributeValues: {
            ':pid': identityId,
            ':bid': botId,
        },
        ScanIndexForward:          false,
    });

    return qres.Items || [];
}

async function fetchPolls(identityId, botId) {
    reportDebug('fetchPolls: identityId=', identityId, 'botId=', botId);
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

async function fetchUser(identityId, botId, channel, userId) {
    reportDebug('fetchUsers: identityId=', identityId, ', channel=', channel, ', botId=', botId);
    return await aws.getUserByUserId(identityId, botId, channel, userId);
}

/**
 * At least one of userId or email must be provided.
 * If userId is not provided, a fake user will be created.
 *
 * In order to change a user's email address, provide both userId and (new) email.
 * If both userId and email are provided and the email is different, the user will have to
 * verify the new email
 *
 * Will return the new/updated item.
 *
 * @param identityId
 * @param botId
 * @param channel
 * @param userId optional. Must already exist in the database
 * @param email optional.
 * @param userRole optional, defaults to 'user'
 */
async function saveUser(
    identityId: string, botId: string, channel: string,
    userId?: string, email?: string, userRole?: string
) {
    reportDebug('saveUser: ', arguments);

    if (!userRole) userRole = 'user';
    if (email) email = email.trim().toLowerCase();

    if (!botId || !channel || (!userId && !email)) {
        throw { error: E.SAVE_USER_GENERAL };
        // throw new Error(`saveUser must provide botId, channel, and either userId or emailId or both. `);
    }

    if (email && !userId) {
        // create new fake user if email doesn't exist
        const oldUser = await aws.getUserByEmail(identityId, botId, channel, email);
        if (oldUser) {
            throw { error: E.SAVE_USER_GENERAL };
            // throw new Error(`Email already exists ${email}`);
        }
        const user = {
            publisherId: identityId,
            botId_channel_userId: composeKeys(
                botId, channel, `dummy::${shortLowerCaseRandomId()}`
            ),
            botId_channel_email: composeKeys(botId, channel, email),
            conversationId: `dummy`,
            userRole,
            prefs: {},
            isFake: true,
        };
        await aws.dynamoPut({
            TableName: CONSTANTS.DB_TABLE_USERS,
            Item: user,
        });
        return user;
    }


    // we have userId now

    const oldUser = await aws.getUserByUserId(identityId, botId, channel, userId);
    if (!oldUser) {
        throw { error: E.SAVE_USER_GENERAL };
        // throw new Error(`invalid userId: ${userId}`);
    }
    const oldEmail =
        oldUser.botId_channel_email && decomposeKeys(oldUser.botId_channel_email)[2];
    const emailHasChanged = email && email !== oldEmail;

    if (!email || !emailHasChanged) {
        // update attributes other than email
        const user = await aws.dynamoUpdate({
            TableName: CONSTANTS.DB_TABLE_USERS,
            Key:{
                publisherId: identityId,
                botId_channel_userId: composeKeys(botId, channel, userId),
            },
            // ConditionExpression: 'attribute_exists(publisherId)',
            UpdateExpression: 'SET userRole = :userRole',
            ExpressionAttributeValues: {
                ':userRole': userRole,
            },
            ReturnValues: 'ALL_NEW'
        });
        reportDebug('saveUser returning ', user.Attributes);
        return user.Attributes;
    }

    // we have both email and userId
    // update attributes including email and force user to verify
    const user = await aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_USERS,
        Key:{
            publisherId: identityId,
            botId_channel_userId: composeKeys(botId, channel, userId),
        },
        // ConditionExpression: 'attribute_exists(publisherId)',
        UpdateExpression:
            ' SET    botId_channel_email = :bce      ' +
            ',       userRole            = :userRole ' +
            ',       conversationId      = :ci       ' +
            ' REMOVE prefs.verificationToken         ' +
            ',       isVerified                      ' +
            ',       unverifiedVerificationToken     ',
        ExpressionAttributeValues: {
            ':bce': composeKeys(botId, channel, email),
            ':userRole': userRole,
            ':ci': 'dummy'
        },
        ReturnValues: 'ALL_NEW'
    });
    reportDebug('saveUser returning ', user.Attributes);
    return user.Attributes;
}

async function fetchConversations(identityId, botId, since: number = 0) {
    reportDebug('fetchConversations: identityId=', identityId, 'botId=', botId, 'since=', since);
    // TODO paging
    // see dynamoAccumulatePages in aws-helper.js

    let query = {
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
    };

    if (since) {
        query.FilterExpression                    = 'lastMessage.creationTimestamp > :since';
        query.ExpressionAttributeValues[':since'] = since;
    }

    const qres = await aws.dynamoQuery(query);

    return qres.Items || [];
}

async function fetchMessages(identityId, conversationId, since: number = 0) {
    reportDebug('fetchMessages: ', identityId, 'conversationId:', conversationId, 'since=', since);
    let query = {
        TableName: CONSTANTS.DB_TABLE_MESSAGES,
        KeyConditionExpression: 'publisherId_conversationId = :pc',
        ExpressionAttributeValues: {
            ':pc': composeKeys(identityId, conversationId),
        },
    };

    if (since) {
        query.KeyConditionExpression                    += ' AND creationTimestamp >= :since';
        query.ExpressionAttributeValues[':since'] = since;
    }

    const qres = await aws.dynamoQuery(query);

    // reportDebug('qres: ', qres);
    return qres.Items || [];
}

async function registerCiscosparkWebhook(
    identityId, botName, botId, ciscosparkAccessToken
) {
    const ciscosparkWebhookSecret = uuid.v4();
    const csClient = ciscospark.init({
        credentials: {
            access_token: ciscosparkAccessToken,
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
    const ret = {
        ciscosparkWebhookSecret,
        ciscosparkWebhookId: webhook.id,
        ciscosparkBotPersonId: me.id,
    };
    reportDebug(`registered ciscospark webhook: `, ret);
    return ret;
}


async function unregisterCiscosparkWebhook(ciscosparkWebhookId, ciscosparkAccessToken) {
    const csClient = ciscospark.init({
        credentials: {
            access_token: ciscosparkAccessToken,
        },
    });
    await csClient.webhooks.remove(ciscosparkWebhookId);
    reportDebug(`removed ciscospark webhook ${ciscosparkWebhookId}`)
    return {
        ciscosparkWebhookSecret: null,
        ciscosparkWebhookId: null,
        ciscosparkBotPersonId: null,
    }

}

async function addBot(identityId, botName, settings) {
    reportDebug('addBot: ', identityId, botName, settings);
    const botId = uuid.v4();
    let ciscosparkSettings = {};
    if (settings.ciscosparkAccessToken) {
        ciscosparkSettings = await registerCiscosparkWebhook(
            identityId, botName, botId, settings.ciscosparkAccessToken
        );
    }

    await aws.dynamoPut({
        TableName: CONSTANTS.DB_TABLE_BOTS,
        Item: aws.dynamoCleanUpObj({
            publisherId: identityId,
            botId,
            botName,
            settings: {
                ...settings,
                ...ciscosparkSettings,
            },
        })
    });
}

/**
 *
 * Inside model.settings, the only ciscospark setting set by the publisher is
 * ciscosparkAccessToken. The rest, ciscosparkBotPersonId, ciscosparkWebhookSecret
 * and ciscosparkWebhookId are all set automatically when registering or unregistering
 * the ciscospark webhooks.
 *
 * If ciscosparkAccessToken is different, the old ciscospark webhook will be automatically
 * unregistered and if it is not empty a new webhook will be registered and the extra
 * ciscospark settings will be set.
 */
async function updateBot(identityId, botId, model) {
    reportDebug('updateBot: ', identityId, botId, model);
    const bot = await aws.getBot(identityId, botId);
    if (!bot) {
        throw { errorCode: E.UPDATE_BOT_GENERAL };
    }

    let ciscosparkSettings = {};
    if (model.settings.ciscosparkAccessToken != bot.settings.ciscosparkAccessToken) {
        if (bot.settings.ciscosparkAccessToken) {
            ciscosparkSettings = await unregisterCiscosparkWebhook(
                bot.settings.ciscosparkWebhookId, bot.settings.ciscosparkAccessToken
            );
        }
        if (model.settings.ciscosparkAccessToken) {
            ciscosparkSettings = await registerCiscosparkWebhook(
                identityId, model.botName || '', botId, model.settings.ciscosparkAccessToken
            );
        }
    }

    const settings = {
        ...bot.settings,
        ...model.settings,
        ...ciscosparkSettings,
    };
    reportDebug('updateBot settings: ', settings);
    let newBot = await aws.dynamoUpdate({
        TableName:                 CONSTANTS.DB_TABLE_BOTS,
        Key:                       {publisherId: identityId, botId},
        UpdateExpression:          `set botName = :botName, 
                                        botIcon = :botIcon, 
                                        onlyAllowedUsersCanChat = :onlyAllowedUsersCanChat, 
                                        isPublic = :isPublic, 
                                        settings = :settings,
                                        defaultLanguage = :defaultLanguage
                                    `,
        ExpressionAttributeValues: {
            ':botName':                 model.botName || null,
            ':botIcon':                 model.botIcon || null,
            ':defaultLanguage':         model.defaultLanguage || null,
            ':onlyAllowedUsersCanChat': model.onlyAllowedUsersCanChat || false,
            ':isPublic':                model.isPublic || false,
            ':settings':                aws.dynamoCleanUpObj(settings),
        },
        ReturnValues:                    'ALL_NEW'
    });
    return newBot.Attributes;
}

async function addBotFeed(identityId, botId: string, feedConfig: FeedConfig) {
    const feedConfigWithId = {
        ...feedConfig,
        feedId: uuid.v4(),
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

async function forceSendFeeds(identityId, botId: string) {
    const botParams = await aws.getBot(identityId, botId);
    if (!botParams) {
        throw { code: E.FORCE_SEND_FEEDS_GENERAL };
    }
    await updateFeedsForBot(botParams, true);
}


async function sendNotification(identityId, botId, message, categories) {
    reportDebug('sendNotification: ', identityId, botId, message);
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
