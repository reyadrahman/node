/* @flow */

import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import { callbackToPromise } from '../../misc/utils.js';
import { request, CONSTANTS } from '../server-utils.js';
import type { WebhookMessage, ResponseMessage } from '../../misc/types.js';
import * as aws from '../../aws/aws.js';
import builder from 'botbuilder';
import type { Request, Response } from 'express';
import memoize from 'lodash/memoize';


async function handle(req: Request, res: Response) {
    const { publisherId, botId } = req.params;
    const botParams = await aws.getBot(publisherId, botId);

    const connector = new builder.ChatConnector({
        appId: botParams.settings.microsoftAppId,
        appPassword: botParams.settings.microsoftAppPassword,
    });

    const ubot = new builder.UniversalBot(connector);
    const botListener = connector.listen();
    const authRequest = callbackToPromise(connector.authenticatedRequest, connector);

    ubot.dialog('/', async function(session) {
        try {
            await processMessage(session, authRequest, botParams);
            console.log('Success');
        } catch(err) {
            console.log('Error: ', err || '-');
        }
    });

    botListener(req, res);
}

async function processMessage(session, authRequest, botParams) {
    const m = session.message;
    const atts = m.attachments;
    const filesGetFn = !atts ? undefined :
        atts.filter(a => a.contentType && a.contentType.startsWith('image')).map(
            a => memoize(async function () {
                console.log('ms-webhook: attachment download requested');
                let buffer;
                // some services such as slack do not accept Authenticated requests
                // for downloading attachments. But some services require it.
                const cid = m.address.channelId;
                console.log('ms-webhook, processMessage, channelId: ', cid);
                if (cid === 'slack' || cid === 'webchat') {
                    buffer = await getBinary(request, a.contentUrl);
                } else {
                    buffer = await getBinary(authRequest, a.contentUrl);
                }
                console.log('ms-webhook: successfully downloaded attachment');
                return buffer;
            })
        );

    const message: WebhookMessage = {
        publisherId_conversationId:
            aws.composeKeys(botParams.publisherId, m.address.conversation.id),
        creationTimestamp: new Date(m.timestamp).getTime(),
        id: m.address.id,
        senderId: session.message.user.id,
        senderName: session.message.user.name,
        source: m.address.channelId + 'bot',
        text: session.message.text,
        filesGetFn,
    };

    console.log('ms-webhook: got message: ', message);
    console.log('ms-webhook: attachments: ', atts);

    const responses = [];
    setTimeout(() => {
        if (responses.length === 0) {
            session.sendTyping();
        }
    }, CONSTANTS.TYPING_INDICATOR_DELAY_S * 1000);
    await deepiksBot(message, botParams, m => {
        responses.push(respondFn(session, m));
    });

    console.log('ms-webhook: await all responses');
    await Promise.all(responses);
};

async function getBinary(requestFn, url) {
    const r = await requestFn({
        url,
        encoding: null,
    });
    if (r.statusCode !== 200 || !r.body) {
        throw new Error(`ms-webhook: attachment download failed with error: ` +
                        `${r.statusCode}, ${r.statusMessage}, \n\turl was: ${url}`)
    }
    return r.body;
}

async function respondFn(session, message: ResponseMessage) {
    console.log('respondFn: ', message);

    if (typeof message === 'string' && message.trim()) {
        session.send(message);
    } else if (typeof message === 'object') {
        const { files, text, quickReplies } = message;
        if (files && files.length || text) {
            const m = new builder.Message(session)
            if (text) {
                m.text(message.text);
            }
            if (files && files.length) {
                m.attachments(files.map(
                    url => ({
                        contentType: 'image',
                        contentUrl: url,
                    })
                ));
            }
            session.send(m);
        }

        if (quickReplies && quickReplies.length) {
            const textQR = quickReplies.map(
                x => typeof x === 'string' ? x : x.postback || x.text
            );
            respondFn(session, `(some possible answers: ${textQR.join(', ')})`);
        }
    }
}

export default function(req: Request, res: Response) {
    if (req.method !== 'POST') {
        res.send();
        return;
    }

    handle(req, res)
        .then(() => {
            console.log('Success');
        })
        .catch(err => {
            console.log('Error: ', err || '-');
            if (err instanceof Error) {
                throw err;
            }
        });
}

/*
{
  "time": "Wed, 13 Jul 2016 16:23:11 GMT",
  "method": "POST",
  "url": "/webhooks/ms",
  "protocol": "http",
  "headers": {
   "host": "chatbot-dev.9rpxkmjsyb.us-east-1.elasticbeanstalk.com",
   "x-real-ip": "172.31.56.58",
   "x-forwarded-for": "40.76.219.238, 172.31.56.58",
   "content-length": "260",
   "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSIsIng1dCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSJ9.eyJpc3MiOiJodHRwczovL2FwaS5ib3RmcmFtZXdvcmsuY29tIiwiYXVkIjoiOTA4NjVkNWEtZDZkZC00OWZmLWEwNWYtYTBlZWIzOTM5MWVlIiwiZXhwIjoxNDY4NDI3NTkxLCJuYmYiOjE0Njg0MjY5OTF9.DRvfKwz9oDGwre6xRIBmz3nHUflqgTM_fPQiSkXxkkm8OJFTGKoqd3ovJxiA3gNti1kJ9R5eOrxFGhrEZVJz1yeVUkrK60aQ-WOqrGiBHBxSP9fkfbGXiCCZV5ZteHcvNpH_iQulXgMhwChJ9NmnTnihvHBqLYDfUfb6iusHXBn9MejIrG6fGllzZp2Op7CKrGh0GNMFS7aKWbt7yrTnBQHZuJqFZ4RvybCT29ZtlobwFB7ySdYoAgl0GEftgqMhjdjMgDwX8rfxL_B2iVMDRVh9y8gNdL97Jl-ip7_F9o1YhkGTV7FUR7Ado5ZVjCr13yknSZmY20Xl6P9iSenT4w",
   "content-type": "application/json; charset=utf-8",
   "x-forwarded-port": "443",
   "x-forwarded-proto": "https"
  },
  "body": {
   "type": "ping",
   "timestamp": "0001-01-01T00:00:00",
   "serviceUrl": "https://dev.botframework.com/",
   "channelId": "test",
   "from": {
    "id": "portal"
   },
   "conversation": {
    "id": "ping"
   },
   "recipient": {
    "id": "bot"
   }
  }
 },
*/
