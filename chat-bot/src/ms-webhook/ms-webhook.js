import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import builder from 'botbuilder';
import { callbackToPromise, memoize0, request } from '../lib/util.js';

const { MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD } = process.env;

const connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);
const botListener = connector.listen();
const authRequest = callbackToPromise(connector.authenticatedRequest, connector);

bot.dialog('/', async function(session) {
    try {
        await processMessage(session);
        console.log('Success');
    } catch(err) {
        console.log('Error: ', err || '-');
    }
});

async function processMessage(session) {
    const m = session.message;
    const atts = m.attachments;
    const filesGetFn = !atts ? null :
        atts.filter(a => a.contentType && a.contentType.startsWith('image')).map(
            a => memoize0(async function () {
                console.log('ms-webhook: attachment download requested');
                let buffer;
                // some services such as slack do not accept Authenticated requests
                // for downloading attachments. But some services require it.
                if (m.address.channelId === 'slack') {
                    buffer = await getBinaryUnauth(a.contentUrl);
                } else {
                    buffer = await getBinaryAuth(a.contentUrl);
                }
                console.log('ms-webhook: successfully downloaded attachment');
                return buffer;
            })
        );

    const message = {
        roomId: m.address.conversation.id,
        created: m.timestamp,
        id: m.address.id,
        personId: session.message.user.id,
        //personEmail: ,
        sourceBot: m.address.channelId + 'bot',
        text: session.message.text,
        files: null,
        filesGetFn,
    };

    console.log('ms-webhook: got message: ', message);
    console.log('ms-webhook: attachments: ', atts);

    await deepiksBot(message, m => {
        respondFn(session, m);
    });

};

async function getBinary(requestFn, url) {
    const r = await requestFn({
        url,
        encoding: null,
    });
    if (r.statusCode !== 200 || !r.body) {
//        console.error('ms-webhook: attachment download failed with error: ', r.statusCode, r.statusMessage);
        throw new Error('ms-webhook: attachment download failed with error: ',
                        r.statusCode, r.statusMessage, '\n\turl was: ', url)
    }
    return r.body;
}

const getBinaryAuth = url => getBinary(authRequest, url);
const getBinaryUnauth = url => getBinary(request, url);

async function respondFn(session, message) {
    console.log('respondFn: ', message);

    if (typeof message === 'string' && message.trim()) {
        session.send(message);
    } else if (typeof message === 'object') {
        // if (message.text) {
        //     session.send(message.text);
        // }

        if (message.files) {
            const m = new builder.Message(session)
                .text(message.text)
                .attachments(message.files.map(url => ({
                    contentType: 'image',
                    contentUrl: url,
                })));
            session.send(m);
        }
    }
}

export default function(req, res) {
    if (req.method !== 'POST') {
        res.send();
        return;
    }

    botListener(req, res);
}

/*
{
  "time": "Wed, 13 Jul 2016 16:23:11 GMT",
  "method": "POST",
  "url": "/webhooks/ms",
  "protocol": "http",
  "headers": {
   "host": "chatbot-dev.9rpxkmjsyb.us-east-1.elasticbeanstalk.com",
   "x-real-ip": "172.31.56.58",
   "x-forwarded-for": "40.76.219.238, 172.31.56.58",
   "content-length": "260",
   "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSIsIng1dCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSJ9.eyJpc3MiOiJodHRwczovL2FwaS5ib3RmcmFtZXdvcmsuY29tIiwiYXVkIjoiOTA4NjVkNWEtZDZkZC00OWZmLWEwNWYtYTBlZWIzOTM5MWVlIiwiZXhwIjoxNDY4NDI3NTkxLCJuYmYiOjE0Njg0MjY5OTF9.DRvfKwz9oDGwre6xRIBmz3nHUflqgTM_fPQiSkXxkkm8OJFTGKoqd3ovJxiA3gNti1kJ9R5eOrxFGhrEZVJz1yeVUkrK60aQ-WOqrGiBHBxSP9fkfbGXiCCZV5ZteHcvNpH_iQulXgMhwChJ9NmnTnihvHBqLYDfUfb6iusHXBn9MejIrG6fGllzZp2Op7CKrGh0GNMFS7aKWbt7yrTnBQHZuJqFZ4RvybCT29ZtlobwFB7ySdYoAgl0GEftgqMhjdjMgDwX8rfxL_B2iVMDRVh9y8gNdL97Jl-ip7_F9o1YhkGTV7FUR7Ado5ZVjCr13yknSZmY20Xl6P9iSenT4w",
   "content-type": "application/json; charset=utf-8",
   "x-forwarded-port": "443",
   "x-forwarded-proto": "https"
  },
  "body": {
   "type": "ping",
   "timestamp": "0001-01-01T00:00:00",
   "serviceUrl": "https://dev.botframework.com/",
   "channelId": "test",
   "from": {
    "id": "portal"
   },
   "conversation": {
    "id": "ping"
   },
   "recipient": {
    "id": "bot"
   }
  }
 },
*/
