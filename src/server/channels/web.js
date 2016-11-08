/* @flow */

import type {WebhookMessage, ResponseMessage, WebchannelMessage} from '../../misc/types.js';
import {deepiksBot} from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import {composeKeys} from '../../misc/utils.js';
import uuid from 'node-uuid';

const reportDebug = require('debug')('deepiks:web');
const reportError = require('debug')('deepiks:web:error');

const conversationIdToWebsocket = {};

const attachmentRegex = /^data:.+\/(.+);base64,(.*)$/;

async function handleWebsocketMessage(messageReceived: WebchannelMessage, ws: WebSocket) {
    reportDebug('Handling received message', typeof messageReceived, messageReceived);

    //Retrieve bot
    const botParams = await aws.getBot(messageReceived.publisherId, messageReceived.botId);

    //Store the websocket server for the conversationId

    conversationIdToWebsocket[messageReceived.conversationId] = ws;

    const message: WebhookMessage = {
        publisherId_conversationId: composeKeys(botParams.publisherId, messageReceived.conversationId),
        creationTimestamp:          +messageReceived.creationTimestamp,
        id:                         uuid.v1(),
        channel:                    'web',
        senderIsBot:                false,
        senderName:                 'WebChannel user ' + messageReceived.senderId,
        senderId:                   messageReceived.senderId,
        text:                       messageReceived.text,
    };

    if (messageReceived.cards) {
        let cards             = messageReceived.cards;
        messageReceived.cards = undefined;

        message.fetchCardImages = cards.map(card => {
            let matches = card.imageUrl.match(attachmentRegex);
            // let ext     = matches[1];
            let data    = matches[2];

            return () => new Buffer(data, 'base64');
        });
    }

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

