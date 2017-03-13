import request from 'request-promise';
import MessageValidator from 'sns-validator';
import {MailParser} from 'mailparser';
import striptags from 'striptags';
import moment from 'moment';

import {composeKeys} from '../../misc/utils.js';
import type {WebhookMessage, ResponseMessage, BotParams, ChannelData} from '../../misc/types.js';
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
    let conversationId                = (email.subject || '').match(/\[ref:([\w\-]+)\]/);
    let subjectContainsConversationId = false;
    if (conversationId) {
        conversationId                = conversationId[1];
        subjectContainsConversationId = true;
    } else {
        conversationId = uuid.v1();
    }

    let strippedHtml = striptags(email.html);
    let text         = (email.text ? email.text.split('\n\n')[0].replace(/\n/g, ' ') : strippedHtml).trim();

    // search for mention in the rest of the email's body if it does not start with mention
    if (text[0] !== '@') {
        const regex = '(@[^\\s:]+?):';

        let mention = (`${text}\n\n${strippedHtml}`.match(new RegExp(regex, 'g')) || [])
            .map(match => match.match(new RegExp(regex)))
            .map(match => match && match[1] || null).pop();

        if (mention) {
            reportDebug(`Mention detected: ${mention}`);
            text = `${mention} ${text}`;
        }
    }

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

    let channelData = {email: email.from[0]};

    return deepiksBot(message, botParams, m => {
        m.subject = `Re: ${email.subject || ''}` + (subjectContainsConversationId ? '' : ` [ref:${conversationId}]`);
        m.originalEmail = email;
        return send(botParams, conversationId, m, channelData);
    }, channelData);
}


export async function send(botParams: BotParams, conversationId: string, message: ResponseMessage, channelData: ChannelData) {
    reportDebug('Sending email: bp=', botParams, 'cid=', conversationId, 'm=', message, 'cd=', channelData);

    let body = {}, quote = {text: '', html: ''};

    if (message.originalEmail) {
        let email      = message.originalEmail;
        let from       = email.from[0].name ? `${email.from[0].name} <${email.from[0].address}>` : email.from[0].address;
        let quoteTitle = `On ${moment(email.date).format('ddd, MMM D, YYYY [at] hh:mm A')}, ${from} wrote:`;

        let quoteText = email.text.split('\n').map(line => '> ' + line).join('\n');

        quote.text = `\n\n${quoteTitle}\n\n${quoteText}`;
        quote.html = `<br><br><div>${quoteTitle}<blockquote>${email.html}</blockquote></div>`;
    }

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

        quote.html && html.push(quote.html);

        body['Html'] = {
            Data:    html.join('<hr>'),
            Charset: 'utf8'
        }
    }

    if(message.actions) {
        message.text += '\n\n' + message.actions.map(a => '- ' + a.text).join('\n');
    }

    body['Text'] = {
        Data:    (message.text || 'no message in bot reply') + quote.text,
        Charset: 'utf8'
    };

    let subject = message.subject || `Message from ${botParams.botName} [ref:${conversationId}]`;

    await aws.sesSendEmail({
        Destination: {
            ToAddresses: [
                `${channelData.email.name} <${channelData.email.address}>`
            ]
        },
        Message:     {
            Body:    body,
            Subject: {
                Data:    subject,
                Charset: 'utf8'
            }
        },
        Source:      `${botParams.botName} <${botParams.botId}@quickreply.email>`
    }).catch(error => {
        reportError("Could not send email: ", error.message);

        return Promise.reject(error);
    });
}
