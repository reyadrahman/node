/* @flow */
import {CONSTANTS} from '../server-utils.js';
import {decomposeKeys, composeKeys} from '../../misc/utils.js';
import type {WebhookMessage, ResponseMessage, BotParams, ChannelData} from '../../misc/types.js';
import {deepiksBot} from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import type {Request, Response} from 'express';
import moment from 'moment';
import uuid from 'node-uuid';

import request from 'request-promise';

import fs from 'fs';

import * as tropo from 'tropo-webapi';

const reportDebug = require('debug')('deepiks:tropo');
const reportError = require('debug')('deepiks:tropo:error');


export async function webhook(req: Request, res: Response) {
    // respond immediately

    let session = req.body.session;

    // fs.writeFileSync(`/tmp/tropo_${(new Date()).getTime()}.json`, JSON.stringify(req.body));

    reportDebug(req.body);

    if (!session) {
        res.send();
        return Promise.reject('unrecognised request');
    }

    if (session.parameters) {
        reportDebug('got cold send', session.parameters);

        let tropoResponse = new tropo.TropoWebAPI();

        if (session.parameters.phone && session.parameters.text) {
            //to, answerOnMedia, channel, from, headers, name, network, recording, required, timeout
            tropoResponse.call(session.parameters.phone, null, null, null, null, null, "SMS", null, null, null);
            tropoResponse.say(session.parameters.text);

            res.send(tropo.TropoJSON(tropoResponse));
        } else {
            res.send();
        }

        return Promise.resolve();
    }

    const {publisherId, botId} = req.params;
    const botParams            = await aws.getBot(publisherId, botId);

    let previousConversation;

    if(session.initialText.substr(0, 6) !== '/start'){
        try {
            previousConversation = await findPreviousConversation(botParams, session.from.e164Id);
        } catch (e) {
            return Promise.reject(e);
        }
    } else {
        session.initialText = session.initialText.substr(6).trim();
    }

    const conversationId = previousConversation ?
        decomposeKeys(previousConversation.botId_conversationId)[1] :
        uuid.v1();

    if (previousConversation) {
        reportDebug('Continuing previous conversation');
    }

    reportDebug('Conversation Id: ', conversationId);

    // const conversationId = [session.id, session.from.e164Id].join('::');
    // const conversationId = ['tropo', session.from.e164Id].join('::');


    const message: WebhookMessage = {
        publisherId_conversationId: composeKeys(botParams.publisherId, conversationId),
        creationTimestamp:          Date.parse(session.timestamp),
        id:                         [session.callId, session.timestamp].join('::'),
        senderId:                   session.from.e164Id,
        senderIsBot:                false,
        channel:                    'tropo',
        text:                       session.initialText,
        senderName:                 session.from.e164Id
    };

    let replied = false;
    let channelData      = {phone: session.from.e164Id};

    return deepiksBot(message, botParams, m => {
        if (!replied) {
            let tropoResponse = new tropo.TropoWebAPI();

            let text = m.text;
            if (m.actions) {
                text = text + "\n" + m.actions.map(a => a.text).join("\n");
            }

            tropoResponse.say(text);

            res.send(tropo.TropoJSON(tropoResponse));
            replied = true;

        } else {
            return send(botParams, conversationId, m, channelData);
        }
    }, channelData)
    .then(() => {
        if (!replied) {
            res.send();
        }
    });
}


export async function send(botParams: BotParams, conversationId: string,
                           message: ResponseMessage, channelData: ChannelData) {
    let text = message.text;
    if (message.actions) {
        text = text + "\n" + message.actions.map(a => a.text).join("\n");
    }

    let params = {
        action: 'create',
        token:  '58516e68565447514f47716e584578586971684473556d6872534d58464f594f444a756870775a5859664145',
        phone:  channelData.phone,
        text
    };

    reportDebug('Asking Tropo to init session');

    return request({
        uri: 'https://api.tropo.com/1.0/sessions',
        qs:  params
    })
    .then(response => reportDebug(response))
    .catch(response => reportError(response));
}


async function findPreviousConversation(botParams: BotParams, phoneNumber) {
    let query = {
        TableName:                 CONSTANTS.DB_TABLE_CONVERSATIONS,
        IndexName:                 'byLastInteractiveMessage',
        KeyConditionExpression:    'publisherId = :pid and begins_with(botId_lastInteractiveMessageTimestamp_messageId, :bid)',
        FilterExpression:          'lastMessage.creationTimestamp > :since AND channel = :channel',
        ExpressionAttributeValues: {
            ':pid':     botParams.publisherId,
            ':bid':     botParams.botId,
            ':since':   moment().subtract(2, 'hours').toDate().getTime(),
            ':channel': 'tropo'
        },
        ScanIndexForward:          false,
    };

    const qres = await aws.dynamoQuery(query);

    if (qres.Items) {
        let conversations = qres.Items.filter(item => item.participantsIds.values.includes(phoneNumber));

        if (conversations.length) {
            conversations.sort((a, b) => b.lastMessage.creationTimestamp - a.lastMessage.creationTimestamp);
            return conversations[0];
        }
    }

    return null;
}
