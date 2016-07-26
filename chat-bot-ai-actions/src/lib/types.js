export type ActionRequest = {
    sessionId: string,
    context: Object,
    text: string,
    entities: Object,
};

export type ActionResponseMessage = string | {
    text?: string,
    files?: Array<string>,
};

export type ActionResponse = {
    msg?: ActionResponseMessage,
    context: Object,
};
