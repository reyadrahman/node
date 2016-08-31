/* @flow */

import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import { request } from '../server-utils.js';
import type { WebhookMessage, ResponseMessage } from '../../misc/types.js';
import { toStr } from '../../misc/utils.js';
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
}

async function handle(req: Request) {
    const body: SparkReqBody = (req.body: any);

    console.log('------- spark-webhook: req.body: ', toStr(body));

    if (body.resource !== 'messages' || body.event !== 'created') {
        return;
    }

    const { publisherId, botId } = req.params;
    const botParams = await aws.getBot(publisherId, botId);
    const { settings: { ciscosparkBotPersonId, ciscosparkAccessToken,
                        ciscosparkWebhookSecret, ciscosparkWebhookId } } = botParams;

    const hmac = crypto.createHmac('sha1', botParams.settings.ciscosparkWebhookSecret);
    hmac.update(req.rawBody, 'utf-8');
    const expectedSig = hmac.digest('hex');
    const sig = req.get('X-Spark-Signature');
    if (sig !== expectedSig) {
        console.error(`ERROR: exprected signatue: ${expectedSig} but received ${sig}`);
        res.status(403).send('Access denied');
        return;
    }
    console.log(`X-Spark-Signature successfully verified ${sig}`);


    if (!ciscosparkBotPersonId) {
        console.error('ciscosparkBotPersonId is empty');
        return;
    }
    if (ciscosparkWebhookId !== body.id) {
        console.error(`ciscosparkWebhookId doesn't match. Got: `, body.id,
                      `, but expected: `, ciscosparkWebhookId)
        return;
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
        publisherId_conversationId: aws.composeKeys(botParams.publisherId, rawMessage.roomId),
        creationTimestamp: new Date(rawMessage.created).getTime(),
        id: rawMessage.id,
        senderId: rawMessage.personId,
        senderName: senderProfile.displayName,
        source: 'ciscospark',
        text: rawMessage.text,
        fetchCardImages,
    };

    console.log('got message: ', message);

    const responses = [];
    await deepiksBot({
        ...message,
        sourceBot: 'ciscospark',
    }, botParams, m => {
        responses.push(respondFn(client, roomId, m))
    });

    await Promise.all(responses);
}

async function respondFn(client, roomId, message) {
    console.log('respondFn sending message: ', message);
    if (typeof message === 'string' && message.trim()) {
        await client.messages.create({
            text: message,
            roomId,
        });
        return;
    }
    if (typeof message !== 'object') {
        console.log('respondFn: message is not an object');
        return;
    }

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
                roomId,
            });
            const cardText = actionsToStr(c.actions);
            await client.messages.create({
                text: cardText || '',
                roomId,
            });
        }
    }

    if (text || actions) {
        const textToSend = (
            (text || '') + '\n' + actionsToStr(actions)
        ).trim();
        await client.messages.create({
            text: textToSend || '',
            roomId,
        });
    }
};

export default function(req: Request, res: Response) {
    // respond immediately
    res.send();

    handle(req)
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
