/* @flow */

import { request, CONSTANTS } from '../server-utils.js';
import { toStr, waitForAll, composeKeys, decomposeKeys } from '../../misc/utils.js';
import type { WebhookMessage, ResponseMessage, BotParams, WebchannelMessage } from '../../misc/types.js';
import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import type { Request, Response } from 'express';
import _ from 'lodash';
import uuid from 'node-uuid';
import u from 'util';
import crypto from 'crypto';
import { Server as WebSocketServer } from 'ws';

async function handleWebsocketMessage(
    messageReceived: WebchannelMessage, wss: WebSocketServer)
{
    //Retrieve bot
    const { publisherId, botId } = messageReceived;
    const botParams = await aws.getBot(publisherId, botId);

    //Retrieve message data
    const { conversationId, senderId, text, timestamp } = messageReceived.data;

    const message: WebhookMessage = {
        publisherId_conversationId: composeKeys(botParams.publisherId, message.id),
        creationTimestamp: new Date(timestamp).getTime(),
        id: body.id,
        senderId: senderId,
        senderIsBot: false,
        channel: 'web',
        text: text,
    };

    console.log('Got message: ', message);

    await deepiksBot(message, botParams, wss, m => {
        responses.push(send(botParams, conversationId, m))
    });

    await waitForAll(responses);
}

export async function send(botParams: BotParams, conversationId: string,
    wss: WebSocketServer, message: ResponseMessage)
{
    wss.send(message);
}

export function websocketMessage(messageReceived: WebchannelMessage,
    wss: WebSocketServer)
{
    res.send(); // respond immediately ???
    console.log('webChannel-message...');
    handleWebhookRequest(messageReceived, wss)
    .then(() => {
        console.log('Success')
    })
    .catch(err => {
        console.log('Error: ', err || '-');
        if (err instanceof Error) {
            throw err;
        }
    });
}
