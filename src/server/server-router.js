/* @flow */

import express from 'express';
import render from './server-side-rendering.js';
import bridge from './client-server-bridge.js';
import { webhooks } from './channels/all-channels.js';
import periodicTasksUpdate from './periodic-tasks/all-periodic-tasks.js';
import { Server as WebSocketServer } from 'ws';

export default function initializeRoutes(server) {
    const routes = express.Router();

    routes.use('/api', bridge);

    routes.use('/webhooks/:publisherId/:botId/:channel', (req, res, next) => {
        const { channel } = req.params;
        console.log('server-routes');
        console.log('channel: ', channel);
        console.log('publisherId: ', req.params.publisherId);
        console.log('botId: ', req.params.botId);

        if (!webhooks[channel]) {
            return next(new Error(`Unknown channel: ${channel}`));
        }

        webhooks[channel](req, res);
    });

    routes.post('/run-periodic-tasks', (req, res, next) => {
        periodicTasksUpdate(req, res);
    });

    routes.use('/', (req, res, next) => {
        console.log('server-router: /, cookies: ', req.cookies);
        render(!req.cookies.signedIn, req, res, next);
    });

/*
    const wss = new WebSocketServer({ server });

    wss.on('connection', function(ws) {
      console.log('Conversation on web channel initialized (server side).');
    });

    wss.on('message', function incoming(message: WebReqBody) {
      if (message.sender === 'user') {
        websocketMessage(message, wss);
      }
    });

    wss.on('close', function close() {
      console.log('Conversation on web channel ended (server side).');
    })
*/

    return routes;
}
