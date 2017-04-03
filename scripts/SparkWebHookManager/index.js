"use strict";

// ciscospark/dist depends on Array.prototype.includes which is not supported
// by node 4.3
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
      return Array.prototype.indexOf.call(this, searchElement, fromIndex) !== -1;
  };
}

require('dotenv').config();

const ciscospark = require('ciscospark/dist').default;
const uuid = require('node-uuid');

function main() {
    const argv = process.argv;
    if (argv[2] === 'list' && argv[3] === 'webhooks') {
        console.log('Getting webhooks...\n');
        ciscospark.webhooks.list()
            .then(list => {
                const listArr = Array.from(list);
                listArr.forEach(x => {
                    console.log('-----------------');
                    console.log('webhook name: ', x.name);
                    console.log('target url: ', x.targetUrl);
                    console.log('webhook id: ', x.id);
                    console.log('webhook event: ', x.event);
                    console.log('webhook resource: ', x.resource);
                    x.filter && console.log('chatroom id: ', x.filter.match(/roomId=(.*)/)[1])
                });
            })
            .catch(err => {
                console.log('Failed to the webhooks.')
                console.error(err);
            });

    } else if (argv[2] === 'list' && argv[3] === 'chatrooms') {
        console.log('Getting chatrooms...\n');
        ciscospark.rooms.list()
            .then(list => {
                const listArr = Array.from(list);
                listArr.forEach(x => {
                    console.log('-----------------');
                    console.log('chat room name: ', x.title);
                    console.log('chat room id: ', x.id);
                });
            })
            .catch(err => {
                console.log('Failed to the chatrooms.')
                console.error(err);
            });

    } else if (argv[2] === 'register' && argv[3] && argv[4]) {
        // register name roomId targetUrl
        console.log('Registering webhook...\n');
        const secret = uuid.v1();
        let webhook;

        ciscospark.webhooks.create({
            name: argv[3],
            // filter: `roomId=${argv[4]}`,
            targetUrl: argv[4],
            resource: `all`,
            event: `all`,
            secret: secret,
        }).then(w => {
            webhook = w;
            return ciscospark.people.get('me');
        }).then(me => {
            console.log('\n Webhook created.');
            console.log('\n ciscosparkWebhookSecret: ' + secret);
            console.log('\n ciscosparkWebhookId: ' + webhook.id);
            console.log('\n ciscosparkBotPersonId: ' + me.id);
        }).catch(err => {
            console.log('Failed to register the webhook.')
            console.error(err);
        });
    } else if (argv[2] === 'unregister' && argv[3]) {
        console.log('Unregistering webhook...\n');

        ciscospark.webhooks.remove(argv[3])
            .then(res => {
                console.log('\n Deleted webhook');
            })
            .catch(err => {
                console.log('Failed to unregister the webhook.')
                console.error(err);
            });
    } else {
        printHelp();
    }
}

function printHelp() {
    console.log(
        `usage: node index.js <command>\n\n` +
        `Commands:\n` +
        `  help\n` +
        `  list webhooks\n` +
        `  list chatrooms\n` +
        `  register <webhook name> <target url>\n` +
        `  unregister <webhook id>`);
}

main();
