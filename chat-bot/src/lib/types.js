/* @flow */

export type DBMessage = {
    publisherId_conversationId: string,
    creationTimestamp: number,
    id?: string,
    senderId?: string,
    source?: string,
    text?: string,
    files?: Array<string>,
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
};
