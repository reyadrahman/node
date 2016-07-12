import deepiksBot from '../deepiks-bot/deepiks-bot.js';
import URL from 'url';
import ciscospark from 'ciscospark/dist';

const { CISCOSPARK_BOT_EMAIL, CISCOSPARK_ACCESS_TOKEN } = process.env;


async function handle(req) {
    console.log('CISCOSPARK_BOT_EMAIL: ', CISCOSPARK_BOT_EMAIL);
    if (req.body.data.personEmail.toLowerCase() === CISCOSPARK_BOT_EMAIL.toLowerCase()) {
        return;
    }

    const roomId = req.body.data.roomId;

    const message = await ciscospark.messages.get(req.body.data.id);
    console.log('got message: ', message);

    const responses = [];
    await deepiksBot({
        ...message,
        filesDownloadAuth: `Bearer ${CISCOSPARK_ACCESS_TOKEN}`,
        sourceBot: 'ciscospark',
    }, m => {
        responses.push(respondFn(roomId, m))
    });

    await Promise.all(responses);
}

async function respondFn(roomId, message) {
    console.log('respondFn sending message: ', message);
    if (typeof message === 'string' && message.trim()) {
        await ciscospark.messages.create({
            text: message,
            roomId,
        });
    } else if (typeof message === 'object') {
        // ciscospark can only send 1 file at a time
        const toBeSent = [];
        if (message.text) {
            await ciscospark.messages.create({
                text: message.text,
                roomId,
            });
        }
        if (message.files) {
            // TODO 1 at a time
            await Promise.all(
                message.files.map(
                    x => ciscospark.messages.create({
                        text: '',
                        files: [x],
                        roomId,
                    })
                )
            );
        }
    }
};


export default function(req, res) {
    // respond immediately
    res.send();

    handle(req)
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
