/* @flow */

import { fetchjp, fetchg2j } from './client-utils.js';
import type { DBMessage, ContactFormData } from '../misc/types.js';

export async function addBot(jwtIdToken: string, botName: string, settings) {
    console.log('client-server-bridge addBot:');
    console.log('\tjwtIdToken: ', jwtIdToken);
    console.log('\tbotName: ', botName);
    console.log('\tsettings: ', settings);

    return await fetchjp('/api/add-bot', { jwtIdToken, botName, settings })
}

export async function fetchBots(jwtIdToken: string) {
    console.log('fetchBots: jwtIdToken: ', jwtIdToken);
    return await fetchg2j('/api/fetch-bots', { jwtIdToken });
}

export async function fetchConversations(jwtIdToken: string) {
    console.log('fetchConversations: jwtIdToken: ', jwtIdToken);
    return await fetchg2j('/api/fetch-conversations', { jwtIdToken });
}

export async function fetchMessages(jwtIdToken: string, conversationId: string)
    : Promise<DBMessage[]>
{
    console.log('fetchMessages: jwtIdToken: ', jwtIdToken, conversationId);
    return await fetchg2j('/api/fetch-messages', { jwtIdToken, conversationId });
}

export async function fetchWebChatSessionToken(jwtIdToken?: string)
    : Promise<string>
{
    console.log('fetchWebChatSessionToken: jwtIdToken: ', jwtIdToken);
    const params = jwtIdToken ? { jwtIdToken } : {};
    return await fetchg2j('/api/fetch-web-chat-session-token', params);
}

export async function sendEmail(contactFormData: ContactFormData) {
    return await fetchjp('/api/send-email', { contactFormData })
}

export async function sendNotification(jwtIdToken: string, botId: string, message: string) {
    return await fetchjp('/api/send-notification', { jwtIdToken, botId, message });
}
