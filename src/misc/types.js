/* @flow */

export type QuickReply = string | {
    text: string,
    file?: string,
};

export type DBMessage = {
    publisherId_conversationId: string,
    creationTimestamp: number,
    id?: string,
    senderId?: string,
    source?: string,
    text?: string,
    files?: Array<string>,
    quickReplies?: Array<QuickReply>,
};

export type WebhookMessage = {
    publisherId_conversationId: string,
    creationTimestamp: number,
    id: string,
    senderId: string,
    source: string,
    text?: string,
    files?: Array<string>,
    filesGetFn?: Array<() => Buffer>,
};

export type ResponseMessage = string | {
    files?: Array<string>,
    text?: string,
    action?: 'typingOn' | 'typingOff',
    quickReplies?: Array<QuickReply>,
};

export type ActionRequest = {
    sessionId: string,
    context: Object,
    text: string,
    entities: Object,
    publisherId: string,
    botId: string,
};

export type ActionResponseMessage = string | {
    text?: string,
    files?: Array<string>,
    quickReplies?: Array<QuickReply>,
};

export type ActionResponse = {
    msg?: ActionResponseMessage,
    context: Object,
};

export type BotParams = {
    botId: string,
    publisherId: string,
    settings: {
        ciscosparkAccessToken: string,
        messengerPageAccessToken: string,
        microsoftAppId: string,
        microsoftAppPassword: string,
        ciscosparkBotEmail: string,
        witAccessToken: string,
    },
};

export type AIActionInfo =
    {
        action: string,
        url?: string,
        lambda?: string,
    };
