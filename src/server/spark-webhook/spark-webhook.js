/* @flow */

import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import { request } from '../server-utils.js';
import type { WebhookMessage, ResponseMessage } from '../../misc/types.js';
import * as aws from '../../aws/aws.js';
import URL from 'url';
import ciscospark from 'ciscospark';
import type { Request, Response } from 'express';
import memoize from 'lodash/memoize';

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

    if (body.resource !== 'messages' || body.event !== 'created') {
        return;
    }
    const { publisherId, botId } = req.params;
    const botParams = await aws.getBot(publisherId, botId);
    const { settings: { ciscosparkBotEmail, ciscosparkAccessToken } } = botParams;
    if (!ciscosparkBotEmail ||
        body.data.personEmail.toLowerCase() === ciscosparkBotEmail.toLowerCase()) {
        return;
    }

    const { roomId, id: messageId } = body.data;

    const client = ciscospark.init({
        credentials: {
            access_token: ciscosparkAccessToken,
        },
    });

    const rawMessage = await client.messages.get(messageId);
    const filesGetFn = !rawMessage.files ? undefined : rawMessage.files.map(
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
        source: 'ciscosparkbot',
        text: rawMessage.text,
        filesGetFn,
    };

    console.log('got message: ', message);

    const responses = [];
    await deepiksBot({
        ...message,
        //TODO filesDownloadAuth: `Bearer ${CISCOSPARK_ACCESS_TOKEN}`,
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
    } else if (typeof message === 'object') {
        // ciscospark can only send 1 file at a time
        const { files, text, quickReplies } = message;
        const toBeSent = [];
        if (text) {
            await client.messages.create({
                text: text,
                roomId,
            });
        }
        if (files && files.length) {
            // TODO 1 at a time
            await Promise.all(
                files.map(
                    x => client.messages.create({
                        text: '',
                        files: [x],
                        roomId,
                    })
                )
            );
        }
        if (quickReplies && quickReplies.length) {
            const textQR = quickReplies.map(
                x => typeof x === 'string' ? x : x.postback || x.text
            );
            respondFn(client, roomId, `(some possible answers: ${textQR.join(', ')})`);
        }

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
