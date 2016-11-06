/* @flow */

export type User = {
    publisherId: string,
    botId_channel_userId: string,
    prefs: UserPrefs,
    userRole: 'user' | 'admin' | 'none',
    botId_channel_email?: string,
    userLastMessage?: DBMessage,
    unverifiedVerificationToken?: string,
    associatedFakeUserId?: string,
    isFake?: boolean,
    isVerified?: boolean,
};

// is that it?
export type UserPrefs = Object;

export type Conversation = {
    channel: string,
    botId_conversationId: string,
    lastMessage: DBMessage,
    botId_lastInteractiveMessageTimestamp_messageId: string,
    publisherId: string,
    witData?: WitData,
    customAIData?: CustomAIData,
    channelData?: ChannelData,
    lastParticipantProfilePic?: string,
    participantsNames?: {
        type: 'string',
        values: string[],
    },
    participantsIds?: {
        type: 'string',
        values: string[],
    },
};

export type ChannelData = {
    address: Object, // microsoft bot framework specific
};

export type WitData = {
    context: Object,
    sessionId: string,
    lastActionPrefix?: string,
};

export type CustomAIData = {
    context: Object,
    session: Object,
};


export type MessageAction = {
    text: string,
    postback?: string,
    fallback?: string,
};

export type MessageCard = {
    imageUrl: string,
    title?: string,
    subtitle?: string,
    actions?: MessageAction[],
};

export type DBMessage = {
    publisherId_conversationId: string,
    creationTimestamp: number,
    senderIsBot: boolean,
    senderId: string,
    channel: string,
    id: string,
    senderName?: string,
    text?: string,
    cards?: MessageCard[],
    actions?: MessageAction[],
    senderProfilePic?: string,
    poll?: {
        pollId: string,
        questionId: string,
        isQuestion: boolean,
    },
};

export type WebhookMessage = {
    publisherId_conversationId: string,
    creationTimestamp: number,
    id: string,
    channel: string,
    senderIsBot: boolean,
    senderId: string,
    senderName?: string,
    text?: string,
    cards?: MessageCard[],
    fetchCardImages?: Array<() => Promise<Buffer>>,
    senderProfilePic?: string,
};

export type WebchannelMessage = {
    id: string,
    sender: string, // Storing 'bot' or 'user' to handle at the right place
    publisherId: string,
    botId: string,
    data: {
        conversationId: string,
        senderId: string,
        text: string,
        timestamp: number,
    }
};

export type ResponseMessage = {
    text?: string,
    cards?: MessageCard[],
    actions?: MessageAction[],
    typingOn?: boolean,
    creationTimestamp?: number,
    poll?: {
        pollId: string,
        questionId: string,
    },
    preprocessorActions?: MessagePreprocessorAction[],
};

export type MessagePreprocessorAction = {
    action: string,
    args: string[],
};

export type RespondFn = (response: ResponseMessage) => Promise<void>;

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


export type FeedConfig = FeedConfigTwitter | FeedConfigRss;

export type FeedConfigTwitter = {
    type: 'twitter',
    feedId: string,
    feedName: string,
    twitterScreenName: string,
    lastPublishTimestamp: number,
    publishTimePattern: string,
    categories?: string[],
};

export type FeedConfigRss = {
    type: 'rss',
    feedId: string,
    feedName: string,
    rssUrl: string,
    lastPublishTimestamp: number,
    publishTimePattern: string,
    categories?: string[],
};

export type BotParams = {
    botId: string,
    botName: string,
    defaultLanguage: string,
    publisherId: string,
    onlyAllowedUsersCanChat: boolean,
    settings: {
        ciscosparkAccessToken?: string,
        ciscosparkBotPersonId?: string,
        ciscosparkBotEmail?: string,
        ciscosparkWebhookSecret?: string,
        ciscosparkWebhookId?: string,
        messengerPageAccessToken?: string,
        messengerAppSecret?: string,
        microsoftAppId?: string,
        microsoftAppPassword?: string,
        witAccessToken?: string,
        twitterConsumerKey?: string,
        twitterConsumerSecret?: string,
        dashbotFacebookKey?: string,
        dashbotGenericKey?: string,
        secretWebchatCode?: string,
    },
    feeds?: FeedConfig[],
};

export type AIActionInfo = {
    action: string,
    url?: string,
    lambda?: string,
};

export type ContactFormData = {
    name: string,
    email: string,
    subject: string,
    message: string,
};

export type ServerConstants = {
    NODE_ENV: string,
    PLATFORM: string,
    AWS_REGION: string,
    AWS_ACCESS_KEY_ID: string,
    AWS_SECRET_ACCESS_KEY: string,
    DB_TABLES_PREFIX: string,
    DB_TABLE_BOTS: string,
    DB_TABLE_CONVERSATIONS: string,
    DB_TABLE_MESSAGES: string,
    DB_TABLE_AI_ACTIONS: string,
    DB_TABLE_USERS: string,
    DB_TABLE_SCHEDULED_TASKS: string,
    DB_TABLE_POLL_QUESTIONS: string,
    S3_BUCKET_NAME: string,
    AI_ACTION_CACHE_VALID_TIME_S: number,
    TYPING_INDICATOR_DELAY_S: number,
    PUBLIC_PATH: string,
    PUBLIC_URL: string,
    USER_POOL_ID: string,
    USER_POOL_APP_CLIENT_ID: string,
    IDENTITY_POOL_ID: string,
    IDENTITY_POOL_UNAUTH_ROLE_ARN: string,
    IDENTITY_POOL_AUTH_ROLE_ARN: string,
    CONTACT_EMAIL: string,
    EMAIL_ACTION_FROM_ADDRESS: string,
    PORT: string,
    OWN_BASE_URL: string,
    CONVERSATIONAL_ENGINE_LAMBDA: string,
    CALL_SERVER_LAMBDA_SECRET: string,
    CDN?: string,
    DEBUG?: string,
};
export type ClientConstants = {
    NODE_ENV: string,
    PLATFORM: string,
    AWS_REGION: string,
    S3_BUCKET_NAME: string,
    PUBLIC_URL: string,
    USER_POOL_ID: string,
    USER_POOL_APP_CLIENT_ID: string,
    IDENTITY_POOL_ID: string,
    IDENTITY_POOL_UNAUTH_ROLE_ARN: string,
    IDENTITY_POOL_AUTH_ROLE_ARN: string,
    OWN_BASE_URL: string,
    SYSTEM_LANG?: string,
    DEBUG?: string,
};
