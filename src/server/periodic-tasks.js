/* @flow */
import { sendToMany } from './channels/all-channels.js';
import * as aws from '../aws/aws.js';
import { ENV } from './server-utils.js';
import { toStr, splitOmitWhitespace, waitForAll, waitForAllOmitErrors,
         callbackToPromise } from '../misc/utils.js';
import _ from 'lodash';
import FeedParser from 'feedparser';
import type { ResponseMessage, BotParams } from '../misc/types.js';
// the name request is usually used for { request } from './server-utils.js'
import request_ from 'request';
import Twit from 'twit';

const { DB_TABLE_PUBLISHER_SETTINGS, CALL_SERVER_LAMBDA_SECRET } = ENV;

type FeedConfig = FeedConfigTwitter | FeedConfigRss;

type FeedConfigTwitter = {
    type: 'twitter',
    botId: string,
    twitterScreenName: string,
    lastPublishTimestamp: number,
    publishTimePattern: string,
    categories?: string[],
};

type FeedConfigRss = {
    type: 'rss',
    botId: string,
    rssUrl: string,
    lastPublishTimestamp: number,
    publishTimePattern: string,
    categories?: string[],
};

type BotFeed = {
    publisherId: string,
    botId: string,
    categories?: string[],
    messages: ResponseMessage[],
};

type ProcessFeedConfigsRes = {
    botFeeds: BotFeed[],
    publisherId: string,
    feedConfigs: FeedConfig[],
};

type BotParamsAccumulator = { [key: string]: BotParams };

export function feedsPeriodicUpdate(req, res) {
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
    const feedsScanRes = await aws.dynamoScan({
        TableName: DB_TABLE_PUBLISHER_SETTINGS,
    });

    console.log('feedsPeriodicUpdateHelper feedsScanRes: ', feedsScanRes);

    if (feedsScanRes.Count === 0) return;

    const publishersSettings = feedsScanRes.Items.filter(x => !_.isEmpty(x.feeds));
    const botParamsAccumulator = {}; // index by publisherId__botId
    const processFeedConfigsResults = await waitForAllOmitErrors(publishersSettings.map(
        settings => processFeedConfigs(settings.publisherId, settings.feeds, botParamsAccumulator)
    ));
    console.log('feedsPeriodicUpdateHelper processFeedConfigsResults: ', toStr(processFeedConfigsResults));

    // now publish feed
    let sendPromises = [];
    processFeedConfigsResults.forEach(
        ({ botFeeds }) => botFeeds.forEach(
            botFeed => botFeed.messages.forEach(
                message => {
                    const botParams = botParamsAccumulator[botFeed.publisherId + '__' + botFeed.botId];
                    if (!botParams) return;
                    sendPromises.push(sendToMany(botParams, message, botFeed.categories));
                }
            )
        )
    );


    // update DB
    const updateDBPromises = processFeedConfigsResults.map(
        ({ botFeeds, feedConfigs, publisherId }) => aws.dynamoUpdate({
            TableName: DB_TABLE_PUBLISHER_SETTINGS,
            Key: {
                publisherId,
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

async function processFeedConfigs(publisherId: string, feedConfigs: FeedConfig[],
                                  botParamsAccumulator: BotParamsAccumulator)
    : Promise<ProcessFeedConfigsRes>
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
    for (let i=0; i<feedConfigs.length; i++) {
        const feedConfig = feedConfigs[i];
        const match = feedConfig.publishTimePattern.match(cronRegexp);
        if (match && hours === Number(match[1])) {
            try {
                let botFeed = await processFeedConfig(publisherId, feedConfig, botParamsAccumulator);
                const newFeedConfig = {
                    ...feedConfig,
                    lastPublishTimestamp: nowTimestamp,
                };
                botFeeds.push(botFeed);
                newFeedConfigs.push(newFeedConfig);
            } catch(error) {
                console.log('processFeedConfigs error while calling processFeedConfig: ', error);
                newFeedConfigs.push(feedConfig);
            }
        } else {
            newFeedConfigs.push(feedConfig);
        }
    }

    return { publisherId, botFeeds, feedConfigs: newFeedConfigs };
}

async function processFeedConfig(publisherId: string, feedConfig: FeedConfig,
                                 botParamsAccumulator: BotParamsAccumulator)
    : Promise<BotFeed>
{
    console.log('processFeedConfig: publisherId: ', publisherId, ', feedConfig: ', feedConfig);
    if (feedConfig.type === 'twitter') {
        return await processTwitterFeedConfig(publisherId, feedConfig, botParamsAccumulator);
    } else if (feedConfig.type === 'rss') {
        return await processRssFeedConfig(publisherId, feedConfig, botParamsAccumulator);
    }
    throw new Error(`processFeed: unknown feed type ${feedConfig.type}`);
}

async function processTwitterFeedConfig(publisherId, feedConfig, botParamsAccumulator): Promise<BotFeed> {
    const botParamsKey = publisherId + '__' + feedConfig.botId;
    let botParams = botParamsAccumulator[botParamsKey];
    if (!botParams) {
        botParams = botParamsAccumulator[botParamsKey]
                  = await aws.getBot(publisherId, feedConfig.botId);
    }
    if (!botParams) {
        throw new Error(`processRssFeedConfig: failed to getBot with id ${feedConfig.botId}`);
        return;
    }

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

    console.log('tweets: ', tweets);

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
        publisherId,
        botId: feedConfig.botId,
        categories: feedConfig.categories,
        messages,
    };
}

function processRssFeedConfig(publisherId, feedConfig, botParamsAccumulator): Promise<BotFeed> {
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

            const ret = {
                publisherId,
                botId: feedConfig.botId,
                categories: feedConfig.categories,
                messages,
            };

            const botParamsKey = publisherId + '__' + feedConfig.botId;
            let botParams = botParamsAccumulator[botParamsKey];
            if (botParams) {
                return resolve(ret);
            }

            aws.getBot(publisherId, feedConfig.botId)
                .then(botParams => {
                    botParamsAccumulator[botParamsKey] = botParams;
                    resolve(ret);
                })
                .catch(error => {
                    console.error('processRssFeedConfig: failed to getBot with id ', feedConfig.botId, error);
                    resolve(ret);
                });
        });
    });
}
