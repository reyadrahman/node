/* @flow */
import { sendToMany } from '../channels/all-channels.js';
import * as aws from '../../aws/aws.js';
import { CONSTANTS } from '../server-utils.js';
import { toStr, timeout, splitOmitWhitespace, waitForAll, waitForAllOmitErrors,
         callbackToPromise } from '../../misc/utils.js';
import type { ResponseMessage, BotParams, FeedConfig } from '../../misc/types.js';
import _ from 'lodash';
import FeedParser from 'feedparser';
// the name request is usually used for { request } from './server-utils.js'
import request_ from 'request';
import Twit from 'twit';
import type { Request, Response } from 'express';
const reportDebug = require('debug')('deepiks:feeds-periodic-task');
const reportError = require('debug')('deepiks:feeds-periodic-task:error');

type FeedMessage = {
    title: string,
    description?: string,
    link?: string,
    imageUrl?: string,
};

type BotFeed = {
    categories?: string[],
    feedMessages: FeedMessage[],
    feedConfig: FeedConfig,
};

type ProcessFeedConfigsRes = {
    botFeeds: BotFeed[],
    feedConfigs: FeedConfig[],
};

export async function updateFeedsPeriodicTask() {
    const botsScanRes = await aws.dynamoScan({
        TableName: CONSTANTS.DB_TABLE_BOTS,
    });
    reportDebug('updateFeedsPeriodicTask botsScanRes: ', toStr(botsScanRes));

    const bots = botsScanRes.Items || [];
    await waitForAll(bots.map(bot => updateFeedsForBot(bot)));
}

/**
 * @param forceSend if set to true, it won't respect the publishTimePattern
 */
export async function updateFeedsForBot(bot: BotParams, forceSend: boolean = false) {
    const processFeedConfigsRes = await processFeedConfigs(bot, forceSend);
    if (!processFeedConfigsRes) return;

    reportDebug('updateFeedsForBot processFeedConfigsRes: ', toStr(processFeedConfigsRes));

    // send feeds to users
    let sendPromises = [];
    for (let botFeed of processFeedConfigsRes.botFeeds) {
        const message = botFeedToResponseMessage(botFeed);
        sendPromises.push(sendToMany(bot, message, botFeed.categories));
        // TODO this is a temporary fix
        // avoid sending messages out of order
        await timeout(1000);
    }

    // update DB
    const updateDBPromises = aws.dynamoUpdate({
        TableName: CONSTANTS.DB_TABLE_BOTS,
        Key: {
            publisherId: bot.publisherId,
            botId: bot.botId,
        },
        UpdateExpression: 'SET feeds = :feeds',
        ExpressionAttributeValues: {
            ':feeds': processFeedConfigsRes.feedConfigs,
        },
    });

    // wait for everything to be done without throwing
    await waitForAll(sendPromises);
    await waitForAll([updateDBPromises]);
}

/**
 * @param forceSend if set to true, it won't respect the publishTimePattern
 */
async function processFeedConfigs(botParams: BotParams, forceSend: boolean = false)
    : Promise<?ProcessFeedConfigsRes>
{
    const feedConfigs = botParams.feeds;
    if (!feedConfigs || feedConfigs.length === 0) return null;

    // Date.now()+5000 to avoid slight time differences
    const now = new Date(Date.now()+5000);
    const nowTimestamp = now.getTime();
    const hours = now.getHours();

    // this is a regexp for cron job syntax
    // currently only supports hours
    const cronRegexp = /\* (\d+) \* \* \*/;

    const botFeeds = [];
    const newFeedConfigs = [];
    // let lastCreationTimestamp = 0;
    for (let feedConfig of feedConfigs) {
        const match = feedConfig.publishTimePattern.match(cronRegexp);
        let newFeedConfig = feedConfig;
        if (forceSend || match && hours === Number(match[1])) {
            try {
                const botFeed = await processFeedConfig(botParams, feedConfig);
                if (!_.isEmpty(botFeed.feedMessages)) {
                    newFeedConfig = {
                        ...newFeedConfig,
                        lastPublishTimestamp: nowTimestamp,
                    };
                    botFeeds.push(botFeed);
                }
            } catch(error) {
                reportDebug('processFeedConfigs error while calling processFeedConfig: ', error);
            }
        }
        newFeedConfigs.push(newFeedConfig);
    }

    return _.isEmpty(botFeeds) ? null : {
        botFeeds,
        feedConfigs: newFeedConfigs,
    };
}

async function processFeedConfig(botParams: BotParams, feedConfig: FeedConfig)
    : Promise<BotFeed>
{
    reportDebug('processFeedConfig: botParams: ', botParams, ', feedConfig: ', feedConfig);
    if (feedConfig.type === 'twitter') {
        return await processTwitterFeedConfig(botParams, feedConfig);
    } else if (feedConfig.type === 'rss') {
        return await processRssFeedConfig(botParams, feedConfig);
    }
    throw new Error(`processFeed: unknown feed type ${feedConfig.type}`);
}

async function processTwitterFeedConfig(botParams, feedConfig): Promise<BotFeed> {
    const twitClient = new Twit({
        consumer_key: botParams.settings.twitterConsumerKey,
        consumer_secret: botParams.settings.twitterConsumerSecret,
        app_only_auth: true,
    });

    const { data: tweets } = await twitClient.get('statuses/user_timeline', {
        screen_name: feedConfig.twitterScreenName,
        include_rts: false,
        count: 10,
    });

    const lpt = feedConfig.lastPublishTimestamp;
    // filter unread items
    const unreadTweets = tweets.filter(
        x => new Date(x.created_at).getTime() > lpt
    );
    reportDebug('unreadTweets: ', unreadTweets);
    const feedMessages = unreadTweets.map(x => {
        const media = (x.entities || []).media || [];
        const photo = media.find(m => m.type === 'photo');
        const imageUrl = photo && (photo.media_url_https || photo.media_url);
        return {
            title: `@${feedConfig.twitterScreenName}`,
            description: x.text,
            link: `https://twitter.com/statuses/${x.id_str}`,
            imageUrl,
        };
    });

    return {
        categories: feedConfig.categories,
        feedMessages,
        feedConfig,
    };
}

function processRssFeedConfig(botParams, feedConfig): Promise<BotFeed> {
    return new Promise((resolve, reject) => {
        reportDebug('processRssFeed');
        const req = request_(feedConfig.rssUrl);
        const feedParser = new FeedParser({
            feedurl: feedConfig.rssUrl,
            addmeta: false,
        });

        req.on('error', function (error) {
            reject(error);
        });
        req.on('response', function (res) {
            if (res.statusCode != 200) {
                return this.emit('error',
                    new Error(`processRssFeedConfig request failed with status ${res.statusCode}`));
            }
            this.pipe(feedParser);
        });


        feedParser.on('error', function(error) {
            reject(error);
        });

        const accumulator = [];
        feedParser.on('readable', function() {
            let item;
            while (item = this.read()) {
                accumulator.push(item);
            }
        });

        feedParser.on('end', function() {
            const lpt = feedConfig.lastPublishTimestamp || 0;
            // filter unread items
            const rssItems = accumulator.filter(
                x => !x.pubDate || new Date(x.pubDate).getTime() > lpt
            );
            const feedMessages = rssItems.map(x => {
                const { title, description, link, enclosures } = x;
                const enclosure = enclosures && enclosures.find(e => {
                        if (e.type) {
                            return e.type.includes('image');
                        }

                        if (e.url) {
                            return e.url.includes('.jpg') || e.url.includes('.jpeg') || e.url.includes('.png');
                        }

                        return false;
                    });
                return {
                    title,
                    description,
                    link,
                    imageUrl: enclosure && enclosure.url,
                };
            });

            return resolve({
                categories: feedConfig.categories,
                feedMessages,
                feedConfig,
            });
        });
    });
}

function botFeedToResponseMessage(botFeed: BotFeed): ResponseMessage {
    const { feedConfig, feedMessages } = botFeed;

    const expandFeedActionLink = (linkTemplate, message) => {
        if (!linkTemplate) return message.link;
        return linkTemplate.replace(/\{\s*link\s*\}/gi, message.link || '');
    };
    return {
        creationTimestamp: Date.now(),
        cards: feedMessages.slice(0, 5).map(m => ({
            title: m.title,
            subtitle: m.description,
            imageUrl: m.imageUrl,
            actions: feedConfig.actions && feedConfig.actions.map(a => {
                return a.postback ? {
                    text: a.text,
                    postback: a.postback,
                    fallback: a.postback,
                } : {
                    text: a.text,
                    url: expandFeedActionLink(a.link, m),
                };
            }),
        })),
    };
}

