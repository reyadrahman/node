/* @flow */

import {composeKeys} from '../../misc/utils.js';
import type {WebhookMessage, ResponseMessage, BotParams} from '../../misc/types.js';
import {deepiksBot} from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import type {Request, Response} from 'express';

import request from 'request-promise';

import fs from 'fs';

import * as tropo from 'tropo-webapi';

const reportDebug = require('debug')('deepiks:tropo');
const reportError = require('debug')('deepiks:tropo:error');


export async function webhook(req: Request, res: Response) {
    // respond immediately

    let session = req.body.session;

    fs.writeFileSync(`/tmp/tropo_${(new Date()).getTime()}.json`, JSON.stringify(req.body));

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

    // not sure is
    // const conversationId = [session.id, session.from.e164Id].join('::');
    const conversationId = ['tropo', session.from.e164Id].join('::');

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

    return deepiksBot(message, botParams, m => {
        if (!replied) {
            replied = true;

            let tropoResponse = new tropo.TropoWebAPI();

            let text = m.text;
            if (m.actions) {
                text = text + "\n" + m.actions.map(a => a.text).join("\n");
            }

            tropoResponse.say(text);

            res.send(tropo.TropoJSON(tropoResponse));

        } else {
            return send(botParams, conversationId, m);
        }
    })
    .then(() => {
        if (!replied) {
            res.send();
        }
    });
}


export async function send(botParams: BotParams, conversationId: string,
                           message: ResponseMessage) {
    let text = message.text;
    if (message.actions) {
        text = text + "\n" + message.actions.map(a => a.text).join("\n");
    }

    let params = {
        action: 'create',
        token:  '58516e68565447514f47716e584578586971684473556d6872534d58464f594f444a756870775a5859664145',
        phone:  conversationId.split('::')[1],
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
