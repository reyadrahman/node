/* @flow */

import {request, ENV, CONSTANTS} from '../server-utils.js';
import {toStr, waitForAll} from '../../misc/utils.js';
import type {WebhookMessage, ResponseMessage, BotParams, WebchannelMessage} from '../../misc/types.js';
import {deepiksBot} from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import {composeKeys, decomposeKeys, shortLowerCaseRandomId} from '../../misc/utils.js';
import _ from 'lodash';
import uuid from 'node-uuid';
import u from 'util';
import crypto from 'crypto';
import {Server as WebSocketServer} from 'ws';

const reportDebug = require('debug')('deepiks:web');
const reportError = require('debug')('deepiks:web:error');

const conversationIdToWebsocket = {};

async function handleWebsocketMessage(messageReceived: WebchannelMessage, ws: WebSocket) {
    reportDebug('Handling received message', typeof messageReceived, messageReceived);

    //Retrieve bot
    const botParams = await aws.getBot(messageReceived.publisherId, messageReceived.botId);

    //Store the websocket server for the conversationId

    conversationIdToWebsocket[messageReceived.conversationId] = ws;

    const message: WebhookMessage = {
        publisherId_conversationId: composeKeys(botParams.publisherId, messageReceived.conversationId),
        creationTimestamp:          +messageReceived.timestamp,
        id:                         uuid.v1(),
        channel:                    'web',
        senderIsBot:                false,
        senderName:                 'WebChannel user ' + messageReceived.senderId,
        senderId:                   messageReceived.senderId,
        text:                       messageReceived.text,
    };

    reportDebug('Got message: ', message);

    try {
        await deepiksBot(message, botParams, responseMessage => {
            reply(messageReceived.conversationId, responseMessage);
        });
    } catch (e) {
        reportError(e.message);
    }
}

export function reply(conversationId: string, message: ResponseMessage) {
    conversationIdToWebsocket[conversationId].send(JSON.stringify(message));
}

export function websocketMessage(messageReceived: WebchannelMessage, ws: WebSocket) {
    handleWebsocketMessage(messageReceived, ws);
}

