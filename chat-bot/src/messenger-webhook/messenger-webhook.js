/* @flow */

import { request } from '../lib/util.js';
import type { WebhookMessage, ResponseMessage } from '../lib/types.js';
import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../lib/aws.js';
import type { BotParams } from '../lib/aws.js';
import type { Request, Response } from 'express';

//const { MESSENGER_PAGE_ACCESS_TOKEN } = process.env;

type MessengerReqBody = {
    object: string,
    entry: Array<MessengerReqEntry>,
};
type MessengerReqEntry = {
    id: string,
    time: number,
    messaging: Array<MessengerReqMessaging>
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
        seq: number,
        text?: string,
        attachments?: Array<MessengerReqAttachment>
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

    const { botId } = req.params;
    const botParams = await aws.getBotById(botId);
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
                await receivedMessage(entry, messagingEvent, botParams);
            } else if (messagingEvent.delivery) {
                // receivedDeliveryConfirmation(messagingEvent);
            } else if (messagingEvent.postback) {
                // receivedPostback(messagingEvent);
            } else {
                console.error('Webhook received unknown messagingEvent: ', messagingEvent);
            }

        }
    }
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
    await deepiksBot(message, m => {
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
        if (message.text) {
            await sendMessage(botParams, {
                recipient: {
                    id: to,
                },
                message: {
                    text: message.text,
                }
            });

        }

        if (message.files) {
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
                            elements: message.files.slice(0,10).map((url, i) => ({
                                title: `${i+1}`,
                                image_url: url,
                                item_url: url,
                            })),
                        }
                    }
                }
            }
            console.log('**** to be sent elements', toBeSent.message.attachment.payload.elements);
            // await sendMessage(toBeSent);
            setTimeout(() => sendMessage(botParams, toBeSent), 3000);
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
