/* @flow */

import * as spark from './spark.js';
import * as messenger from './messenger.js';
import * as ms from './ms.js';
import * as aws from '../../aws/aws.js';
import type { ResponseMessage, BotParams, ChannelData } from '../../misc/types.js';
import { ENV } from '../server-utils.js';

const { DB_TABLE_CONVERSATIONS } = ENV;

export const webhooks = {
    messenger: messenger.webhook,
    spark: spark.webhook,
    ms: ms.webhook,
};

export async function send(botParams: BotParams, conversationId: string,
                           channel: string, message: ResponseMessage,
                           channelData?: ChannelData)
{
    if (channel === 'messenger') {
        return messenger.send(botParams, conversationId, message);
    } else if (channel === 'ciscospark') {
        return spark.send(botParams, conversationId, message);
    } else if (['skype', 'slack', 'telegram', 'webchat'].includes(channel)) {
        if (!channelData) {
            throw new Error('send: channelData is missing');
        }
        return ms.sendCold(botParams, channelData, message);
    }

    throw new Error(`send: unsupported channel ${channel}`);
}

export async function sendAll(botParams: BotParams, message: ResponseMessage) {
    console.log('sendAll: botParams: ', botParams, ', message: ', message);
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_CONVERSATIONS,
        KeyConditionExpression: 'publisherId = :pid',
        FilterExpression: 'botId = :bid',
        ProjectionExpression: 'publisherId, conversationId, channel, channelData',
        ExpressionAttributeValues: {
            ':pid': botParams.publisherId,
            ':bid': botParams.botId,
        },
    });

    if (qres.Count === 0) {
        console.log('sendAll: no conversation found')
        return;
    }

    const sendAllP = await Promise.all(qres.Items.map(
        x => send(botParams, x.conversationId, x.channel, message, x.channelData)
    ));

    console.log('sendAll: successfully send all messages');
}
