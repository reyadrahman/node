/* @flow */

import { fetchjp, fetchjp2j, fetchg2j } from './client-utils.js';
import type { DBMessage, ContactFormData, FeedConfig } from '../misc/types.js';

export async function addBot(jwtIdToken: string, botName: string, settings) {
    console.log('client-server-bridge addBot:');
    console.log('\tjwtIdToken: ', jwtIdToken);
    console.log('\tbotName: ', botName);
    console.log('\tsettings: ', settings);

    return await fetchjp('/api/add-bot', { jwtIdToken, botName, settings })
}

export async function updateBot(jwtIdToken: string, botId: string, settings) {
    console.log('client-server-bridge addBot:');
    console.log('\tjwtIdToken: ', jwtIdToken);
    console.log('\tbotId: ', botId);
    console.log('\tsettings: ', settings);

    return await fetchjp2j('/api/update-bot', { jwtIdToken, botId, settings })
}

export async function fetchBots(jwtIdToken: string) {
    console.log('fetchBots: jwtIdToken: ', jwtIdToken);
    return await fetchg2j('/api/fetch-bots', { jwtIdToken });
}

export async function fetchBotPublicInfo(publisherId: string, botId: string) {
    return await fetchg2j('/api/fetch-bot-public-info', {publisherId, botId});
}

export async function fetchPolls(jwtIdToken: string, botId: string) {
    return await fetchg2j('/api/fetch-polls', {jwtIdToken, botId});
}

export async function fetchUsers(jwtIdToken: string, botId: string) {
    return await fetchg2j('/api/fetch-users', {jwtIdToken, botId});
}

export async function fetchUser(jwtIdToken: string, botId: string, channel, userId: string) {
    return await fetchg2j('/api/fetch-user', {jwtIdToken, botId, channel, userId});
}

export async function saveUser(
    jwtIdToken: string, botId: string, channel: string,
    userId?: string, email?: string, userRole?: string
) {
    return await fetchjp2j('/api/save-user', {
        jwtIdToken, botId, channel, userId, email, userRole
    });
}

export async function fetchConversations(jwtIdToken: string, botId: string, since: int = 0) {
    console.log('fetchConversations: jwtIdToken: ', jwtIdToken, 'botId:', botId, 'since:', since);
    return await fetchg2j('/api/fetch-conversations', { jwtIdToken, botId, since });
}

export async function fetchMessages(jwtIdToken: string, conversationId: string, since: int = 0)
    : Promise<DBMessage[]>
{
    console.log('fetchMessages: jwtIdToken: ', jwtIdToken, conversationId);
    return await fetchg2j('/api/fetch-messages', { jwtIdToken, conversationId, since });
}

export async function addBotFeed(jwtIdToken: string, botId: string, feedConfig: FeedConfig) {
    return await fetchjp('/api/add-bot-feed', { jwtIdToken, botId, feedConfig });
}

export async function sendEmail(contactFormData: ContactFormData) {
    return await fetchjp('/api/send-email', { contactFormData })
}

export async function sendNotification(jwtIdToken: string,
                                       botId: string,
                                       message: string,
                                       categories: string[])
{
    return await fetchjp('/api/send-notification', { jwtIdToken, botId, message, categories });
}

export async function createInvitationTokens(jwtIdToken: string, botId: string, count: number) {
    return await fetchjp('/api/create-invitation-tokens', { jwtIdToken, botId, count });
}
