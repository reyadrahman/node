/* @flow */

import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import { request } from '../server-utils.js';
import type { WebhookMessage, ResponseMessage, BotParams } from '../../misc/types.js';
import { toStr, waitForAll, composeKeys, decomposeKeys } from '../../misc/utils.js';
import * as aws from '../../aws/aws.js';
import URL from 'url';
import ciscospark from 'ciscospark';
import type { Request, Response } from 'express';
import memoize from 'lodash/memoize';
import crypto from 'crypto';

type SparkReqBody = {
    id: string,
    name: string,
    resource: string,
    event: string,
    data:{
        id: string,
        roomId: string,
        personId: string,
        personEmail: string,
        created: string,
    }
};


export async function webhook(req: Request, res: Response) {
    // respond immediately
    res.send();

    const body: SparkReqBody = (req.body: any);

    console.log('------- spark-webhook: req.body: ', toStr(body));

    if (body.resource !== 'messages' || body.event !== 'created') {
        return;
    }

    const { publisherId, botId } = req.params;
    const botParams = await aws.getBot(publisherId, botId);
    if (!botParams) {
        throw new Error(`Did not find bot with publisherId ${publisherId} and botId ${botId}`);
    }
    const { settings: { ciscosparkBotPersonId, ciscosparkAccessToken,
                        ciscosparkWebhookSecret, ciscosparkWebhookId } } = botParams;

    const hmac = crypto.createHmac('sha1', botParams.settings.ciscosparkWebhookSecret);
    hmac.update(req.rawBody, 'utf-8');
    const expectedSig = hmac.digest('hex');
    const sig = req.get('X-Spark-Signature');
    if (sig !== expectedSig) {
        res.status(403).send('Access denied');
        throw new Error(`ERROR: exprected signatue: ${expectedSig} but received ${sig || ''}`);
    }
    console.log(`X-Spark-Signature successfully verified ${sig || ''}`);

    if (!ciscosparkBotPersonId) {
        res.status(500).send('Error');
        throw new Error('ciscosparkBotPersonId is empty');
    }
    if (ciscosparkWebhookId !== body.id) {
        res.status(500).send('Error');
        throw new Error(`ciscosparkWebhookId doesn't match. Got: ${body.id}` +
                        `, but expected: ${ciscosparkWebhookId}`);
    }
    if (ciscosparkBotPersonId === body.data.personId) {
        console.log('skipping own message, personId: ', body.data.personId);
        return;
    }

    const { roomId, id: messageId } = body.data;

    const client = ciscospark.init({
        credentials: {
            access_token: ciscosparkAccessToken,
        },
    });

    const rawMessage = await client.messages.get(messageId);
    const fetchCardImages = !rawMessage.files ? undefined : rawMessage.files.map(
        a => memoize(async function () {
            console.log('spark-webhook: attachment download requested');
            const buffer = await request({
                url: URL.parse(a),
                encoding: null,
                headers: {
                    Authorization: `Bearer ${ciscosparkAccessToken}`,
                },
            });
            console.log('spark-webhook: successfully downloaded attachment');
            return buffer.body;
        })
    );
    const senderProfile = await client.people.get(rawMessage.personId);
    const message: WebhookMessage = {
        publisherId_conversationId: composeKeys(botParams.publisherId, rawMessage.roomId),
        creationTimestamp: new Date(rawMessage.created).getTime(),
        id: rawMessage.id,
        senderId: rawMessage.personId,
        senderName: senderProfile.displayName,
        senderIsBot: false,
        channel: 'ciscospark',
        text: rawMessage.text,
        fetchCardImages,
    };

    console.log('got message: ', message);

    await deepiksBot(message, botParams, m => send(botParams, roomId, m));
}

// roomId is the same as conversationId
export async function send(botParams: BotParams, conversationId: string,
                           message: ResponseMessage) {

    const { settings: { ciscosparkAccessToken } } = botParams;

    const client = ciscospark.init({
        credentials: {
            access_token: ciscosparkAccessToken,
        },
    });

    console.log('send sending message: ', message);
    const actionsToStr = xs =>
        (xs || []).filter(x => x.fallback).map(x => x.fallback).join(', ');
    // ciscospark can only send 1 file at a time
    const { typingOn, text, cards, actions } = message;
    if (cards) {
        for (let i=0; i<cards.length; i++) {
            const c = cards[i];
            await client.messages.create({
                text: '',
                files: [c.imageUrl],
                roomId: conversationId,
            });
            const cardText = actionsToStr(c.actions);
            await client.messages.create({
                text: removeMarkdown(cardText || ''),
                roomId: conversationId,
            });
        }
    }

    if (text || actions) {
        const textToSend = (
            (text || '') + '\n' + actionsToStr(actions)
        ).trim();
        await client.messages.create({
            text: removeMarkdown(textToSend || ''),
            roomId: conversationId,
        });
    }
};

function removeMarkdown(text) {
    return text.replace(/\n\n/g, '\n');
}

