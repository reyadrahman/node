/* @flow */
import { sendToMany } from './channels/all-channels.js';
import * as aws from '../aws/aws.js';
import { ENV } from './server-utils.js';
import { toStr, splitOmitWhitespace, waitForAll, waitForAllOmitErrors,
         callbackToPromise } from '../misc/utils.js';
import _ from 'lodash';
import FeedParser from 'feedparser';
import type { ResponseMessage, BotParams, FeedConfig } from '../misc/types.js';
// the name request is usually used for { request } from './server-utils.js'
import request_ from 'request';
import Twit from 'twit';
import type { Request, Response } from 'express';

const { CALL_SERVER_LAMBDA_SECRET, DB_TABLE_BOTS } = ENV;

type BotFeed = {
    categories?: string[],
    messages: ResponseMessage[],
};

type ProcessFeedConfigsRes = {
    botParams: BotParams,
    botFeeds: BotFeed[],
    feedConfigs: FeedConfig[],
};

export function feedsPeriodicUpdate(req: Request, res: Response) {
    const reqSecret = req.header('CALL_SERVER_LAMBDA_SECRET');
    if (reqSecret !== CALL_SERVER_LAMBDA_SECRET) {
        console.log('feedsPeriodicUpdate: secret header does not match: ', reqSecret);
        return res.status(404).send();
    }
    res.send();

    feedsPeriodicUpdateHelper()
        .catch(error => {
            console.error('ERROR feedsPeriodicUpdate: ', error);
        });
}

async function feedsPeriodicUpdateHelper() {
    const botsScanRes = await aws.dynamoScan({
        TableName: DB_TABLE_BOTS,
    });

    console.log('feedsPeriodicUpdateHelper botsScanRes: ', botsScanRes);

    if (botsScanRes.Count === 0) return;

    const botsWithFeeds = botsScanRes.Items.filter(x => !_.isEmpty(x.feeds));
    const processFeedConfigsResults =
        await waitForAllOmitErrors(botsWithFeeds.map(processFeedConfigs));
    const validProcessFeedConfigsResults = processFeedConfigsResults.filter(Boolean);
    console.log('feedsPeriodicUpdateHelper validProcessFeedConfigsResults: ',
        toStr(validProcessFeedConfigsResults));

    // now publish feeds
    let sendPromises = [];
    validProcessFeedConfigsResults.forEach(
        ({ botFeeds, botParams }) => botFeeds.forEach(
            botFeed => botFeed.messages.forEach(
                message => {
                    sendPromises.push(sendToMany(botParams, message, botFeed.categories));
                }
            )
        )
    );


    // update DB
    const updateDBPromises = validProcessFeedConfigsResults.map(
        ({ botFeeds, feedConfigs, botParams }) => aws.dynamoUpdate({
            TableName: DB_TABLE_BOTS,
            Key: {
                publisherId: botParams.publisherId,
                botId: botParams.botId,
            },
            UpdateExpression: 'SET feeds = :feeds',
            ExpressionAttributeValues: {
                ':feeds': feedConfigs,
            },
        })
    );

    // wait for everything to be done
    await waitForAll(sendPromises);
    await waitForAll(updateDBPromises);
}

// TODO redo return type
async function processFeedConfigs(botParams: BotParams)
    : Promise<?ProcessFeedConfigsRes>
{
    // Date.now()+1000 to avoid millisecond differences
    const now = new Date(Date.now()+1000);
    const nowTimestamp = now.getTime();
    const hours = now.getHours();

    // this is a regexp for cron job syntax
    // currently only supports hours
    const cronRegexp = /\* (\d+) \* \* \*/;

    const botFeeds = [];
    const newFeedConfigs = [];
    for (let i=0; i<botParams.feeds.length; i++) {
        const feedConfig = botParams.feeds[i];
        const match = feedConfig.publishTimePattern.match(cronRegexp);
        let newFeedConfig = feedConfig;
        if (match && hours === Number(match[1])) {
            try {
                let botFeed = await processFeedConfig(botParams, feedConfig);
                if (!_.isEmpty(botFeed.messages)) {
                    newFeedConfig = {
                        ...newFeedConfig,
                        lastPublishTimestamp: nowTimestamp,
                    };
                    botFeeds.push(botFeed);
                }
            } catch(error) {
                console.log('processFeedConfigs error while calling processFeedConfig: ', error);
            }
        }
        newFeedConfigs.push(newFeedConfig);
    }

    return _.isEmpty(botFeeds) ? null : {
        botParams,
        botFeeds,
        feedConfigs: newFeedConfigs,
    };
}

async function processFeedConfig(botParams: BotParams, feedConfig: FeedConfig)
    : Promise<BotFeed>
{
    console.log('processFeedConfig: botParams: ', botParams, ', feedConfig: ', feedConfig);
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
    console.log('unreadTweets: ', unreadTweets);
    const messages = unreadTweets.map(x => ({
        text: x.text
    }));

    return {
        categories: feedConfig.categories,
        messages,
    };
}

function processRssFeedConfig(botParams, feedConfig): Promise<BotFeed> {
    return new Promise((resolve, reject) => {
        console.log('processRssFeed');
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
            const lpt = feedConfig.lastPublishTimestamp;
            // filter unread items
            const rssItems = accumulator.filter(
                x => !x.pubDate || new Date(x.pubDate).getTime() > lpt
            );
            const messages = rssItems.map(x => {
                const { title = '', description = '', link = '' } = x;
                return {
                    text: `${title}\n\n${description}\n\n${link}`.trim(),
                };
            });

            return resolve({
                categories: feedConfig.categories,
                messages,
            });
        });
    });
}
