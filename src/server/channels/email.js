import request from 'request-promise';
import MessageValidator from 'sns-validator';
import {MailParser} from 'mailparser';
import striptags from 'striptags';

import {composeKeys} from '../../misc/utils.js';
import type {WebhookMessage, ResponseMessage, BotParams} from '../../misc/types.js';
import {deepiksBot} from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import type {Request, Response} from 'express';
import uuid from 'node-uuid';

const snsValidator = new MessageValidator();

const reportDebug = require('debug')('deepiks:email');
const reportError = require('debug')('deepiks:email:error');

export async function webhook(req: Request, res: Response) {
    reportDebug('Mail webhook triggered', req.headers, req.body);

    let body = JSON.parse(req.body);

    return new Promise((resolve, reject) => {
        if (process.env.DISABLE_SNS_VALIDATION) {
            return resolve(true);
        }

        try {
            snsValidator.validate(body, err => {
                if (err) { return reject(err);}
                resolve(true);
            });
        } catch (e) {
            reject(e);
        }
    })
    .then(() => {
        if (body['Type'] === 'SubscriptionConfirmation') {
            reportDebug(`Confirming subscription: ${body['SigningCertURL']}`);

            return request({uri: body['SubscribeURL']})
            .then(response => {
                reportDebug('Subscription confirmed')
            })
        }

        if (body['Type'] === 'Notification') {
            let message = JSON.parse(body['Message']);
            let mailObject, botParams;

            return new Promise((resolve, reject) => {
                const mailparser = new MailParser();

                // setup an event listener when the parsing finishes
                mailparser.on("end", function (mailObject) {
                    resolve(mailObject)
                });

                // send the email source to the parser
                mailparser.write(Buffer.from(message.content, 'base64'));
                mailparser.end();
            })
            .then(parsedMailObject => {
                mailObject = parsedMailObject;
                reportDebug('mail received', mailObject);

                let botId = mailObject.to[0].address.split('@')[0];

                return aws.getBotById(botId)
                .then(bot => {
                    if (!bot) {
                        throw new Error(`Did not find bot with botId = ${botId}`);
                    }

                    botParams = bot;
                });
            })
            .then(() => {
                mailObject['x-amz-sns-message-id'] = req.headers['x-amz-sns-message-id'];
                return receivedMessage(mailObject, botParams);
            });
        }
    });
}

async function receivedMessage(email, botParams: BotParams) {
    // reportDebug('email receivedMessage: ', u.inspect(entry, {depth: null}));

    // fetch conversation id from the reference in subject: Re: inquiry ... [ref:aaaa-bbbb-cccc-dddd]
    let conversationId                = email.subject.match(/\[ref:([\w\-]+)\]/);
    let subjectContainsConversationId = false;
    if (conversationId) {
        conversationId                = conversationId[1];
        subjectContainsConversationId = true;
    } else {
        conversationId = uuid.v1();
    }

    let text = (email.text ? email.text.split('\n\n')[0] : striptags(email.html)).trim();

    text = text.substr(0, 50);

    const message: WebhookMessage = {
        publisherId_conversationId: composeKeys(botParams.publisherId, conversationId),
        creationTimestamp:          Date.parse(email.date),
        id:                         email['x-amz-sns-message-id'] || uuid.v1(),
        senderId:                   email.from[0].address,
        senderIsBot:                false,
        channel:                    'email',
        text,
        senderName:                 `${email.from[0].name || ''}`.trim()
    };

    if (email.attachments) {
        message.fetchCardImages = email.attachments.map(attachment => () => attachment.content);
    }


    reportDebug('email sending deepiks-bot: ', message);

    return deepiksBot(message, botParams, m => {
        m.to      = email.from[0];
        m.subject = `Re: ${email.subject}` + (subjectContainsConversationId ? '' : ` [ref:${conversationId}]`);
        return send(botParams, conversationId, m);
    });
}


export async function send(botParams: BotParams, conversationId: string, message: ResponseMessage) {

    let body = {};

    if (message.cards) {
        let html = [];

        if (message.text) {
            html.push(`<div>${message.text}</div>`);
        }

        message.cards.forEach(card => {
            let content = `
                <h1>${card.title}</h1>
                <div><img src="${card.imageUrl}" alt="${card.title}" style="width: 300px"></div>
            `;

            card.actions && card.actions.forEach(action => {
                content += `
                    <div>Reply "${action.postback}" to ${action.text}</div>
                `
            });

            html.push(content);
        });

        body['Html'] = {
            Data:    html.join('<hr>'),
            Charset: 'utf8'
        }
    } else {

    }

    body['Text'] = {
        Data:    message.text || 'no message in bot reply',
        Charset: 'utf8'
    };

    return aws.sesSendEmail({
        Destination: {
            ToAddresses: [
                `${message.to.name} <${message.to.address}>`
            ]
        },
        Message:     {
            Body:    body,
            Subject: {
                Data:    message.subject,
                Charset: 'utf8'
            }
        },
        Source:      `${botParams.botName} <${botParams.botId}@quickreply.email>`
    });
}
