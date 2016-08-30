/* @flow */

export type MessageAction = {
    text: string,
    postback?: string,
    fallback?: string,
};

export type MessageCard = {
    imageUrl: string,
    title?: string,
    subtitle?: string,
    actions?: Array<MessageAction>,
};

export type DBMessage = {
    publisherId_conversationId: string,
    creationTimestamp: number,
    senderName?: string,
    senderId: string,
    id?: string,
    source?: string,
    text?: string,
    cards?: Array<MessageCard>,
    senderProfilePic?: string,
};

export type WebhookMessage = {
    publisherId_conversationId: string,
    creationTimestamp: number,
    id: string,
    senderId: string,
    source: string,
    senderName?: string,
    text?: string,
    cards?: Array<MessageCard>,
    fetchCardImages?: Array<() => Promise<Buffer>>,
    senderProfilePic?: string,
};

export type ResponseMessage = string | {
    text?: string,
    cards?: Array<MessageCard>,
    actions?: Array<MessageAction>,
    typingOn?: boolean,
};

export type ActionRequest = {
    sessionId: string,
    context: Object,
    userPrefs: UserPrefs,
    text: string,
    entities: Object,
    publisherId: string,
    botId: string,
    credentials: {
        accessKeyId: string,
        secretAccessKey: string,
        sessionToken: string,
        expiration: string,
    },
    s3: {
        bucket: string,
        prefix: string,
    }
};

// export type ActionResponseMessage = string | {
//     text?: string,
//     files?: Array<string>,
//     quickReplies?: Array<QuickReply>,
// };
//

export type ActionResponse = {
    msg?: ResponseMessage,
    context: Object,
    userPrefs?: Object,
};

export type BotParams = {
    botId: string,
    botName: string,
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

export type AIActionInfo = {
    action: string,
    url?: string,
    lambda?: string,
};

// is that it?
export type UserPrefs = Object;

export type ContactFormData = {
    name: string,
    email: string,
    subject: string,
    message: string,
};

export type ServerEnv = {
    NODE_ENV: string,
    PLATFORM: string,
    AWS_REGION: string,
    AWS_ACCESS_KEY_ID: string,
    AWS_SECRET_ACCESS_KEY: string,
    DB_TABLE_BOTS: string,
    DB_TABLE_CONVERSATIONS: string,
    DB_TABLE_MESSAGES: string,
    DB_TABLE_AI_ACTIONS: string,
    DB_TABLE_USER_PREFS: string,
    S3_BUCKET_NAME: string,
    GOOGLE_CLOUD_VISION_API_KEY: string,
    MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY: string,
    PUBLIC_PATH: string,
    PUBLIC_URL: string,
    USER_POOL_ID: string,
    USER_POOL_APP_CLIENT_ID: string,
    IDENTITY_POOL_ID: string,
    IDENTITY_POOL_UNAUTH_ROLE_ARN: string,
    IDENTITY_POOL_AUTH_ROLE_ARN: string,
    WIZARD_BOT_WEB_CHAT_SECRET: string,
    CONTACT_EMAIL: string,
    PORT: string,
    CDN?: string,
    DEBUG?: string,
};
export type ClientEnv = {
    NODE_ENV: string,
    PLATFORM: string,
    AWS_REGION: string,
    DB_TABLE_BOTS: string,
    DB_TABLE_CONVERSATIONS: string,
    DB_TABLE_MESSAGES: string,
    DB_TABLE_AI_ACTIONS: string,
    DB_TABLE_USER_PREFS: string,
    S3_BUCKET_NAME: string,
    GOOGLE_CLOUD_VISION_API_KEY: string,
    MICROSOFT_OCP_APIM_SUBSCRIPTION_KEY: string,
    PUBLIC_PATH: string,
    PUBLIC_URL: string,
    USER_POOL_ID: string,
    USER_POOL_APP_CLIENT_ID: string,
    IDENTITY_POOL_ID: string,
    IDENTITY_POOL_UNAUTH_ROLE_ARN: string,
    IDENTITY_POOL_AUTH_ROLE_ARN: string,
    DEBUG?: string,
};
