/* @flow */

import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import { callbackToPromise } from '../../misc/utils.js';
import { request, CONSTANTS } from '../server-utils.js';
import type { RichQuickReply, WebhookMessage, ResponseMessage } from '../../misc/types.js';
import * as aws from '../../aws/aws.js';
import builder from 'botbuilder';
import type { Request, Response } from 'express';
import memoize from 'lodash/memoize';
import { inspect } from 'util';
import _ from 'lodash';


async function handle(req: Request, res: Response) {
    console.log('ms-webhook raw req.body: ', inspect(req.body, {depth:null}));
    console.log('ms-webhook raw req.headers: ', inspect(req.headers, {depth:null}));
    const { publisherId, botId } = req.params;
    const botParams = await aws.getBot(publisherId, botId);

    const connector = new builder.ChatConnector({
        appId: botParams.settings.microsoftAppId,
        appPassword: botParams.settings.microsoftAppPassword,
    });

    const ubot = new builder.UniversalBot(connector);
    const botListener = connector.listen();
    const authRequest = callbackToPromise(connector.authenticatedRequest, connector);

    ubot.dialog('/', async function(session) {
        try {
            await processMessage(session, authRequest, botParams);
            console.log('Success');
        } catch(err) {
            console.log('Error: ', err || '-');
        }
    });

    botListener(req, res);
}

async function processMessage(session, authRequest, botParams) {
    console.log('ms-webhook m.sourceEvent: ', inspect(session.message.sourceEvent, {depth:null}));
    console.log('ms-webhook session: ', inspect(session, {depth:null}));

    const m = session.message;
    const atts = m.attachments;
    const filesGetFn = !atts ? undefined :
        atts.filter(a => a.contentType && a.contentType.startsWith('image')).map(
            a => memoize(async function () {
                console.log('ms-webhook: attachment download requested');
                let buffer;
                // some services such as slack do not accept Authenticated requests
                // for downloading attachments. But some services require it.
                const cid = m.address.channelId;
                console.log('ms-webhook, processMessage, channelId: ', cid);
                // perhaps we could use session.message.address.useAuth ?
                if (cid === 'skype') {
                    buffer = await getBinary(authRequest, a.contentUrl);
                } else {
                    buffer = await getBinary(request, a.contentUrl);
                }
                console.log('ms-webhook: successfully downloaded attachment');
                return buffer;
            })
        );

    let senderName = m.user.name || '';

    // telegram doesn't set m.user.name
    if (!senderName && m.address.channelId === 'telegram') {
        const firstName =
            _.get(m.sourceEvent, 'message.from.first_name') ||
            _.get(m.sourceEvent, 'callback_query.from.first_name') ||
            '';
        const lastName =
            _.get(m.sourceEvent, 'message.from.last_name') ||
            _.get(m.sourceEvent, 'callback_query.from.last_name') ||
            '';
         senderName = `${firstName} ${lastName}`.trim();
    }

    const message: WebhookMessage = {
        publisherId_conversationId:
            aws.composeKeys(botParams.publisherId, m.address.conversation.id),
        creationTimestamp: new Date(m.timestamp).getTime(),
        id: m.address.id,
        senderId: m.user.id,
        senderName,
        source: m.address.channelId,
        text: m.text,
        filesGetFn,
    };

    console.log('ms-webhook: got message: ', message);
    console.log('ms-webhook: attachments: ', atts);

    const responses = [];
    setTimeout(() => {
        if (responses.length === 0) {
            session.sendTyping();
        }
    }, CONSTANTS.TYPING_INDICATOR_DELAY_S * 1000);
    await deepiksBot(message, botParams, m => {
        responses.push(respondFn(session, m));
    });

    console.log('ms-webhook: await all responses');
    await Promise.all(responses);
};

async function getBinary(requestFn, url) {
    const r = await requestFn({
        url,
        encoding: null,
    });
    if (r.statusCode !== 200 || !r.body) {
        throw new Error(`ms-webhook: attachment download failed with error: ` +
                        `${r.statusCode}, ${r.statusMessage}, \n\turl was: ${url}`)
    }
    return r.body;
}

async function respondFn(session, message: ResponseMessage) {
    console.log('respondFn: ', message);

    if (typeof message === 'string' && message.trim()) {
        session.send(message);
    }
    if (typeof message !== 'object') return;

    const { files, text, quickReplies } = message;
    let resMessage = new builder.Message(session)
    let resText = text || '',
        resAttachments = [];

    if (files && files.length) {
        files.forEach(x => {
            const card = new builder.HeroCard(session);
            // x.title && card.title(x.title);
            // x.subtitle && card.subtitle(x.subtitle);
            card.images([
                builder.CardImage.create(session, x)
                       .tap(builder.CardAction.showImage(session, x)),
            ]);
            resAttachments.push(card);
        })
        resText && resMessage.text(resText);
        if (resAttachments.length > 1) {
            // good default fall back behaviour from MS Bot Framework
            resMessage.attachmentLayout(builder.AttachmentLayout.carousel)
        }

        resAttachments && resMessage.attachments(resAttachments);
        session.send(resMessage);

        resMessage = new builder.Message(session)
        resText = '';
        resAttachments = [];
    }

    const { channelId } = session.message.address;
    const supportsHeroCard = ['telegram', 'skype', 'slack'].includes(channelId);
    const hasRichQuickReplies = quickReplies && quickReplies.find(
        x => typeof x === 'object' && x.file);
    const qrs: ?RichQuickReply[] = quickReplies &&
        quickReplies.map(x => {
            return typeof x === 'string' ? { text: x } : x;
        });
    if (qrs && qrs.length) {
        if (hasRichQuickReplies && supportsHeroCard) {
            resAttachments = resAttachments.concat(qrs.map(x => {
                const card = new builder.HeroCard(session);
                x.title && card.title(x.title);
                x.subtitle && card.subtitle(x.subtitle);
                x.file && card.images([
                    builder.CardImage.create(session, x.file)
                           .tap(builder.CardAction.showImage(session, x.file)),
                ]);
                x.text && card.buttons([
                    builder.CardAction.imBack(session, x.postback || x.text, x.text),
                ]);
                return card;
            }))
        } else if (hasRichQuickReplies && !supportsHeroCard) {
            qrs.forEach(x => {
                const card = new builder.HeroCard(session);
                card.title(x.postback || x.text);
                // x.subtitle && card.subtitle(x.subtitle);
                x.file && card.images([
                    builder.CardImage.create(session, x.file)
                           .tap(builder.CardAction.showImage(session, x.file)),
                ]);
                resAttachments.push(card);
                console.log('adding card: ', card);
            })

        } else if (!hasRichQuickReplies && supportsHeroCard) {
            const card = new builder.HeroCard(session);
            card.buttons(qrs.map(
                x => builder.CardAction.imBack(session, x.postback || x.text, x.text)
            ));
            resAttachments.push(card);

        } else if (!hasRichQuickReplies && !supportsHeroCard) {
            const textQR = qrs.map(x => x.postback || x.text);
            resText += `\nOptions: ${textQR.join(', ')}`;
        }
    }

    resText && resMessage.text(resText);

    if (resAttachments.length > 1 && hasRichQuickReplies && supportsHeroCard) {
        resMessage.attachmentLayout(builder.AttachmentLayout.carousel)
    }

    resAttachments && resMessage.attachments(resAttachments);
    session.send(resMessage);
}

export default function(req: Request, res: Response) {
    if (req.method !== 'POST') {
        res.send();
        return;
    }

    handle(req, res)
        .then(() => {
            console.log('Success');
        })
        .catch(err => {
            console.log('Error: ', err || '-');
            if (err instanceof Error) {
                throw err;
            }
        });
}

/*
SESSION:
{
    domain: null,
    _events: {
        error: [Function]
    },
    _eventsCount: 1,
    _maxListeners: undefined,
    options: {
        localizer: undefined,
        autoBatchDelay: 250,
        library: Library {
            name: '*',
            dialogs: {
                '/': SimpleDialog {
                    actions: {},
                    fn: [Function: waterfallAction]
                }
            },
            libraries: {
                BotBuilder: Library {
                    name: 'BotBuilder',
                    dialogs: {
                        Prompts: Prompts {
                            actions: {}
                        },
                        FirstRun: SimpleDialog {
                            actions: {},
                            fn: [Function]
                        }
                    },
                    libraries: {}
                }
            }
        },
        actions: ActionSet {
            actions: {}
        },
        middleware: [],
        dialogId: '/',
        dialogArgs: undefined,
        dialogErrorMessage: undefined,
        onSave: [Function],
        onSend: [Function]
    },
    msgSent: false,
    _isReset: false,
    lastSendTime: 1471858121252,
    batch: [],
    batchStarted: false,
    sendingBatch: false,
    inMiddleware: false,
    library: Library {
        name: '*',
        dialogs: {
            '/': SimpleDialog {
                actions: {},
                fn: [Function: waterfallAction]
            }
        },
        libraries: {
            BotBuilder: Library {
                name: 'BotBuilder',
                dialogs: {
                    Prompts: Prompts {
                        actions: {}
                    },
                    FirstRun: SimpleDialog {
                        actions: {},
                        fn: [Function]
                    }
                },
                libraries: {}
            }
        }
    },
    userData: {},
    conversationData: {},
    privateConversationData: {},
    sessionState: {
        callstack: [{
            id: '*:/',
            state: {
                'BotBuilder.Data.WaterfallStep': 0
            }
        }],
        lastAccess: 1471858121252,
        version: 0
    },
    dialogData: {
        'BotBuilder.Data.WaterfallStep': 0
    },
    message: {
        type: 'message',
        timestamp: '2016-08-22T09:28:35.77Z',
        text: 'Hi',
        entities: [],
        attachments: [],
        address: {
            id: '33OpFYkzE98UfhL6',
            channelId: 'skype',
            user: {
                id: '29:1GGw8qcKlcV9r53s3wCeCZyEXb3temStZ9DMXqLYJfMs',
                name: 'Shahab Shirazi'
            },
            conversation: {
                id: '29:1GGw8qcKlcV9r53s3wCeCZyEXb3temStZ9DMXqLYJfMs'
            },
            bot: {
                id: '28:90865d5a-d6dd-49ff-a05f-a0eeb39391ee',
                name: 'Deepiks'
            },
            serviceUrl: 'https://skype.botframework.com',
            useAuth: true
        },
        source: 'skype',
        agent: 'botbuilder',
        user: {
            id: '29:1GGw8qcKlcV9r53s3wCeCZyEXb3temStZ9DMXqLYJfMs',
            name: 'Shahab Shirazi'
        }
    }
}

*/
