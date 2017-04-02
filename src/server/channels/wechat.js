/* @flow */
import {CONSTANTS} from '../server-utils.js';
import {callbackToPromise, decomposeKeys, composeKeys, timeout} from '../../misc/utils.js';
import type {WebhookMessage, ResponseMessage, BotParams, ChannelData} from '../../misc/types.js';
import {deepiksBot} from '../deepiks-bot/deepiks-bot.js';
import * as aws from '../../aws/aws.js';
import type {Request, Response} from 'express';
import moment from 'moment';
import uuid from 'node-uuid';

const reportDebug = require('debug')('deepiks:wechat');
const reportError = require('debug')('deepiks:wechat:error');

const wechat    = require('wechat');
const WechatAPI = require('wechat-api');

export async function webhook(req: Request, res: Response) {
    res.on('finish', () => { res.closed = true; });

    const {publisherId, botId} = req.params;
    const botParams            = await aws.getBot(publisherId, botId);
    if (!botParams) {
        throw new Error(`Did not find bot with publisherId ${publisherId} and botId ${botId}`);
    }

    const wechatConfig = {
        token:          botParams.settings.wechatToken,
        appid:          botParams.settings.wechatAppID,
        encodingAESKey: botParams.settings.wechatEncodingAESKey,
        checkSignature: true
    };

    console.log('wechatConfig', wechatConfig);

    return new Promise((resolve, reject) => {
        wechat(wechatConfig, async function (req, res) {
            let weixin = req.weixin;

            //res.reply();

            let previousConversation;

            if (weixin.Content.substr(0, 6) !== '/start') {
                try {
                    previousConversation = await findPreviousConversation(botParams, weixin.FromUserName);
                } catch (e) {
                    return reject(e);
                }
            }

            const conversationId = previousConversation ?
                decomposeKeys(previousConversation.botId_conversationId)[1] :
                uuid.v1();

            if (previousConversation) {
                reportDebug('Continuing previous conversation');
            }

            reportDebug('Conversation Id: ', conversationId);

            const message: WebhookMessage = {
                publisherId_conversationId: composeKeys(botParams.publisherId, conversationId),
                creationTimestamp:          weixin.CreateTime * 1000,
                id:                         weixin.MsgId,
                senderId:                   weixin.FromUserName,
                senderIsBot:                false,
                channel:                    'wechat',
                text:                       weixin.Content,
                senderName:                 weixin.FromUserName
            };

            let channelData = {openid: weixin.FromUserName};

            reportDebug('message', 'message');

            resolve(deepiksBot(message, botParams, m => {
                return send(botParams, conversationId, m, channelData, res);
            }, channelData));

        })(req, res);
    });
}


export async function send(botParams: BotParams, conversationId: string,
                           message: ResponseMessage, channelData: ChannelData, res: Request = null) {
    let text = message.text;
    if (message.actions) {
        text = text + "\n" + message.actions.map(a => '- ' + a.text).join("\n");
    }

    if (res && !res.closed) {
        try {
            res.reply(text);
            res.closed = true;
            return;
        } catch (e) {}
    }

    if (!botParams.settings.wechatAppID || !botParams.settings.wechatAppSecret) {
        throw new Error(`WeChat channel: missing AppID/AppSecret for bot ${botParams.botId}:${botParams.botName}`);
    }

    const api = new WechatAPI(botParams.settings.wechatAppID, botParams.settings.wechatAppSecret);

    return callbackToPromise(api.sendText, api)(channelData.openid, text)
        .then(response => reportDebug(response))
        .catch(response => {
            reportError(response);
            return Promise.reject(response);
        });
}


async function findPreviousConversation(botParams: BotParams, fromUserName: string) {
    reportDebug('searching for prev conversation');

    let query = {
        TableName:                 CONSTANTS.DB_TABLE_CONVERSATIONS,
        IndexName:                 'byLastInteractiveMessage',
        KeyConditionExpression:    'publisherId = :pid and begins_with(botId_lastInteractiveMessageTimestamp_messageId, :bid)',
        FilterExpression:          'lastMessage.creationTimestamp > :since AND channel = :channel',
        ExpressionAttributeValues: {
            ':pid':     botParams.publisherId,
            ':bid':     botParams.botId,
            ':since':   moment().subtract(2, 'hours').toDate().getTime(),
            ':channel': 'wechat'
        },
        ScanIndexForward:          false,
    };

    const qres = await aws.dynamoQuery(query);

    if (qres.Items) {
        let conversations = qres.Items.filter(item => item.participantsIds.values.includes(fromUserName));

        if (conversations.length) {
            conversations.sort((a, b) => b.lastMessage.creationTimestamp - a.lastMessage.creationTimestamp);
            return conversations[0];
        }
    }

    return null;
}
