/* @flow */
import * as aws from '../../aws/aws.js';
import { toStr, waitForAll, waitForAllOmitErrors } from '../../misc/utils.js';
import { CONSTANTS } from '../server-utils.js';
import { send } from '../channels/all-channels.js';
import _ from 'lodash';
const reportDebug = require('debug')('deepiks:scheduled-tasks');
const reportError = require('debug')('deepiks:scheduled-tasks:error');

export default async function updateScheduledTasks() {
    const qres = await aws.dynamoQuery({
        TableName: CONSTANTS.DB_TABLE_SCHEDULED_TASKS,
        KeyConditionExpression: 'dummy = :dummy and scheduleTimestamp_taskId <= :now',
        ExpressionAttributeValues: {
            ':dummy': '.',
            ':now': String(Date.now()),
        },
    });

    reportDebug('updateScheduledTasks qres.Items: ', qres.Items);
    if (qres.Count === 0) return;

    const allTasks = qres.Items;
    const messageTasks = qres.Items.filter(x => x.type === 'message');

    // execute message tasks
    const messageTaskPromises = messageTasks.map(async function(task) {
        const botParams = await aws.getBot(task.publisherId, task.botId);
        if (!botParams) {
            throw new Error(`Did not find bot with publisherId ${task.publisherId} and botId ${task.botId}`);
        }
        const conversation =
            await aws.getConversation(task.publisherId, task.botId, task.conversationId);
        if (!conversation) {
            throw new Error(`Did not find conversation with publisherId ` +
                            `${task.publisherId}, botId ${task.botId} ` +
                            `and conversationId ${task.conversationId}`);
        }
        const message = {
            ...task.message,
            creationTimestamp: Date.now(),
        };
        await send(botParams, conversation, message);
    });

    // delete tasks
    // dynamodb batch write limit is 25
    const keys = _.map(allTasks, 'scheduleTimestamp_taskId');
    const chunks = _.chunk(keys, 25);
    reportDebug('chunks: ', chunks);
    const deletePromises = chunks.map(
        chunk => aws.dynamoBatchWrite({
            RequestItems: {
                [CONSTANTS.DB_TABLE_SCHEDULED_TASKS]: chunk.map(x => ({
                    DeleteRequest: {
                        Key: {
                            dummy: '.',
                            scheduleTimestamp_taskId: x,
                        },
                    },
                })),
            },
        })
    );

    await waitForAll(messageTaskPromises);
    await waitForAll(deletePromises);
}
