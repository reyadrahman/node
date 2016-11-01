/* @flow */

import { request, ENV, CONSTANTS } from '../server-utils.js';
import { toStr, waitForAll } from '../../misc/utils.js';
import type { WebhookMessage, ResponseMessage, BotParams, WebchannelMessage } from '../../misc/types.js';
import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import type { Request, Response } from 'express';
import _ from 'lodash';
import uuid from 'node-uuid';
import u from 'util';
import crypto from 'crypto';
import { Server as WebSocketServer } from 'ws';

const reportDebug = require('debug')('deepiks:web');
const reportError = require('debug')('deepiks:web:error');

const conversationIdToWebsocket = {};

async function handleWebsocketMessage(
    messageReceived: WebchannelMessage, ws: WebSocketServer)
{
    //Retrieve bot
    const { publisherId, botId } = messageReceived;
    const botParams = await aws.getBot(publisherId, botId);

    //Retrieve message data
    const { conversationId, senderId, text, timestamp } = messageReceived.data;

    //Store the websocket server for the conversationId
    conversationIdToWebsocket[conversationId] = ws;

    const message: WebhookMessage = {
        publisherId_conversationId: aws.composeKeys(botParams.publisherId, message.id),
        creationTimestamp: new Date(timestamp).getTime(),
        id: body.id,
        senderId: senderId,
        senderIsBot: false,
        channel: 'web',
        text: text,
    };

    reportDebug('Got message: ', message);

    let responses = [];
    await deepiksBot(message, botParams, wss, m => {
        responses.push(send(botParams, conversationId, m))
    });

    await waitForAll(responses);
}

export async function send(botParams: BotParams, conversationId: string,
                           message: ResponseMessage)
{
    conversationIdToWebsocket[conversationId].send(message);
}

export function websocketMessage(messageReceived: WebchannelMessage, wss: WebSocketServer) {
    res.send(); // respond immediately ???
    reportDebug('webChannel-message...');
    handleWebhookRequest(messageReceived, wss)
        .then(() => {
            reportDebug('Success')
        })
        .catch(err => {
            reportDebug('Error: ', err || '-');
            if (err instanceof Error) {
                throw err;
            }
        });
}

