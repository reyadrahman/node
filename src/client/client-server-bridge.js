/* @flow */

import { fetchjp, fetchg2j } from './client-utils.js';
import type { DBMessage } from '../misc/types.js';

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