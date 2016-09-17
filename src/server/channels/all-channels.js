/* @flow */

import * as spark from './spark.js';
import * as messenger from './messenger.js';
import * as ms from './ms.js';
import * as aws from '../../aws/aws.js';
import { waitForAll } from '../../misc/utils.js';
import type { ResponseMessage, BotParams, ChannelData } from '../../misc/types.js';
import { ENV } from '../server-utils.js';
import { toStr } from '../../misc/utils.js';
import _ from 'lodash';

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

export async function sendToMany(botParams: BotParams, message: ResponseMessage, categories?: string[]) {
    console.log('sendAll: botParams: ', botParams, ', message: ', message, ', categories: ', categories);
    // TODO paging
    const qres = await aws.dynamoQuery({
        TableName: DB_TABLE_CONVERSATIONS,
        KeyConditionExpression: 'publisherId = :pid',
        FilterExpression: 'botId = :bid and subscribed <> :s',
        ProjectionExpression: 'publisherId, conversationId, channel, channelData, subscriptions',
        ExpressionAttributeValues: {
            ':pid': botParams.publisherId,
            ':bid': botParams.botId,
            ':s': false,
        },
    });

    console.log('sendToMany, got qres');

    if (qres.Count === 0) {
        console.log('sendAll: no conversation found')
        return;
    }

    let qItems = qres.Items;
    if (categories && categories.length > 0) {
        const categoriesLC = categories.map(x => x.toLowerCase());
        const inCategories = x => categoriesLC.find(y => y.toLowerCase);
        qItems = qItems.filter(
            x => x.subscriptions && x.subscriptions.some(y => inCategories(y.toLowerCase))
        );
    }

    console.log('sendAll: sending to (showing first 10): ', toStr(qItems.slice(0, 10)));

    await waitForAll(qItems.map(
        x => send(botParams, x.conversationId, x.channel, message, x.channelData)
    ));

    console.log('sendAll: successfully send all messages');
}
