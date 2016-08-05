/* @flow */

import { request, CONSTANTS } from '../../misc/utils.js';
import type { WebhookMessage, ResponseMessage, BotParams } from '../../misc/types.js';
import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import type { Request, Response } from 'express';
import _ from 'lodash';
import uuid from 'node-uuid';

//const { MESSENGER_PAGE_ACCESS_TOKEN } = process.env;

type MessengerReqBody = {
    object: string,
    entry: Array<MessengerReqEntry>,
};
type MessengerReqEntry = {
    id: string,
    time: number,
    messaging: Array<MessengerReqMessaging | MessengerReqPostback>
};
type MessengerReqMessaging = {
    sender: {
        id: string,
    },
    recipient: {
        id: string,
    },
    timestamp: number,
    message: {
        mid: string,
        text?: string,
        attachments?: Array<MessengerReqAttachment>
    },
};
type MessengerReqPostback = {
    sender: {
        id: string,
    },
    recipient: {
        id: string,
    },
    timestamp: number,
    postback: {
        payload: string,
    },
};
type MessengerReqAttachment = {
    type: string,
    payload: {
        url: string,
    },
};

async function handle(req: Request, res: Response) {

    // webhook verification
    if (req.method === 'GET' &&
        req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === 'boohoo')
    {
        console.log('Validating webhook');
        res.send(req.query['hub.challenge']);
        return;
    }

    const { publisherId, botId } = req.params;
    const botParams = await aws.getBot(publisherId, botId);
    const body: MessengerReqBody = (req.body: any);

    if (req.method !== 'POST' || body.object !== 'page') {
        res.send();
        return;
    }

    res.send();
    await processMessages(body, botParams);
}

async function processMessages(body: MessengerReqBody, botParams: BotParams) {
    for (let entry of body.entry) {
        for (let messagingEvent of entry.messaging) {
            if (messagingEvent.optin) {
                // receivedAuthentication(messagingEvent);
            } else if (messagingEvent.message) {
                await receivedMessage(entry, (messagingEvent: any), botParams);
            } else if (messagingEvent.delivery) {
                // receivedDeliveryConfirmation(messagingEvent);
            } else if (messagingEvent.postback) {
                await receivedPostback(entry, (messagingEvent: any), botParams);
            } else {
                console.error('Webhook received unknown messagingEvent: ', messagingEvent);
            }

        }
    }
}

async function receivedPostback(entry: MessengerReqEntry,
                                messagingEvent: MessengerReqPostback,
                                botParams: BotParams)
{
    const m: MessengerReqMessaging = {
        sender: messagingEvent.sender,
        recipient: messagingEvent.recipient,
        timestamp: messagingEvent.timestamp,
        message: {
            mid: uuid.v1(),
            text: messagingEvent.postback.payload,
        },
    };
    return await receivedMessage(entry, m, botParams);
}

async function receivedMessage(entry: MessengerReqEntry,
                               messagingEvent: MessengerReqMessaging,
                               botParams: BotParams)
{
    const {attachments} = messagingEvent.message;
    const files = !attachments ? undefined :
        attachments.filter(x => x.type === 'image')
                   .map(x => x.payload.url);

    const conversationId = entry.id + '_' + messagingEvent.sender.id;
    const message: WebhookMessage = {
        publisherId_conversationId:
            aws.composeKeys(botParams.publisherId, conversationId),
        creationTimestamp: new Date(messagingEvent.timestamp).getTime(),
        id: messagingEvent.message.mid,
        senderId: messagingEvent.sender.id,
        source: 'messengerbot',
        text: messagingEvent.message.text,
        files,
    };

    console.log('messenger-webhook sending deepiks-bot: ', message);

    const responses = [];
    setTimeout(() => {
        if (responses.length === 0) {
            respondFn(botParams, conversationId, messagingEvent.sender.id, {
                action: 'typingOn'
            });
        }
    }, CONSTANTS.TYPING_INDICATOR_DELAY_S * 1000);

    await deepiksBot(message, botParams, m => {
        responses.push(respondFn(botParams, conversationId, messagingEvent.sender.id, m));
    });




    await Promise.all(responses);
}

async function respondFn(botParams: BotParams, conversationId: string,
                         to: string, message: ResponseMessage)
{
    console.log('respondFn: ', conversationId, to, message);

    if (typeof message === 'string' && message.trim()) {
        await sendMessage(botParams, {
            recipient: {
                id: to,
            },
            message: {
                text: message,
            }
        });

    } else if (typeof message === 'object') {
        const { action, text, files, quickReplies } = message;
        if (action && action === 'typingOn') {
            await sendMessage(botParams, {
                recipient: {
                    id: to,
                },
                sender_action: 'typing_on',
            });
        }

        const isRichQuickReplies = quickReplies && quickReplies.find(
            x => typeof x === 'object' && x.file);

        if (text || quickReplies && !isRichQuickReplies) {
            const quick_replies = quickReplies && quickReplies.map(x => ({
                content_type: 'text',
                title: x,
                payload: x,
            }));
            await sendMessage(botParams, {
                recipient: {
                    id: to,
                },
                message: _.pickBy({
                    text: text || ' ', // text cannot be empty when using quick_replies
                    quick_replies,
                }, x=>!!x),
            });
        }

        if (quickReplies && isRichQuickReplies) {
            const richQuickReplies = quickReplies.map(x => {
                return typeof x === 'string' ? { text: x } : x;
            });
            await sendMessage(botParams, {
                recipient: {
                    id: to,
                },
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            elements: richQuickReplies.slice(0,10).map((x, i) => ({
                                title: `${i+1}`,
                                image_url: x.file || null,
                                item_url: x.file || null,
                                buttons: [
                                    {
                                        type: 'postback',
                                        title: x.text,
                                        payload: x.text,
                                    }
                                ]
                            })),
                        }
                    }
                }
            });
        }

        if (files && files.length) {
            // TODO do this for only one image
            // for (let file of message.files) {
            //     await sendMessage({
            //         recipient: {
            //             id: to,
            //         },
            //         message: {
            //             attachment: {
            //                 type: 'image',
            //                 payload: {
            //                     url: file
            //                 }
            //             }
            //         }
            //     });
            // }
            const toBeSent = {
                recipient: {
                    id: to,
                },
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            elements: files.slice(0,10).map((url, i) => ({
                                title: `${i+1}`,
                                image_url: url,
                                item_url: url,
                            })),
                        }
                    }
                }
            }
            console.log('**** to be sent elements', toBeSent.message.attachment.payload.elements);
            await sendMessage(botParams, toBeSent);
            // setTimeout(() => sendMessage(botParams, toBeSent), 3000);
        }
    }
}

async function sendMessage(botParams: BotParams, messageData) {
    const r = await request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: botParams.settings.messengerPageAccessToken },
        method: 'POST',
        json: messageData
    });
    if (r.statusCode !== 200) {
        console.error('Sending message failed with code %s msg %s and body: ',
                      r.statusCode, r.statusMessage, r.body);
    }
}


export default function(req: Request, res: Response) {
    console.log('messenger-webhook...');
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
   'object':'page',
   'entry':[
      {
         'id':'257424221305928',
         'time':1467367307425,
         'messaging':[
            {
               'sender':{
                  'id':'1118266251568559'
               },
               'recipient':{
                  'id':'257424221305928'
               },
               'timestamp':1467367307394,
               'message':{
                  'mid':'mid.1467367307265:c73f5c45afc8caf679',
                  'seq':4,
                  'text':'abc'
               }
            }
         ]
      }
   ]
}
*/


/*
{
   'object':'page',
   'entry':[
      {
         'id':'257424221305928',
         'time':1467367423093,
         'messaging':[
            {
               'sender':{
                  'id':'1118266251568559'
               },
               'recipient':{
                  'id':'257424221305928'
               },
               'timestamp':1467367423049,
               'message':{
                  'mid':'mid.1467367422837:afa89b78048420b743',
                  'seq':5,
                  'attachments':[
                     {
                        'type':'image',
                        'payload':{
                           'url':'https://scontent.xx.fbcdn.net/v/t34.0-12/13563531_262326430826149_1733598955_n.png?_nc_ad=z-m&oh=73ed9d6f37f4f0a8eb7780bdaf3d3ae2&oe=5777BEED'
                        }
                     }
                  ]
               }
            }
         ]
      }
   ]
}
*/