/* @flow */

import express from 'express';
import render from './server-side-rendering.js';
import bridge from './client-server-bridge.js';
import { webhooks } from './channels/all-channels.js';
import periodicTasksUpdate from './periodic-tasks/all-periodic-tasks.js';
const reportDebug = require('debug')('deepiks:server-router');
const reportError = require('debug')('deepiks:server-router:error');

import {Server as WebSocketServer} from 'ws';
import {websocketMessage} from './channels/web.js';

export default function initializeRoutes(server) {
    const routes = express.Router();

    routes.use('/api', bridge);

    routes.use('/webhooks/email', (req, res, next) => {
        webhooks.email(req, res)
        .then(() => {
            reportDebug(`The webhook of email completed successfully`);
            res.send('Message processed');
        })
        .catch(error => {
            reportError(`The webhook of email failed with error: `, error);
            res.status(500).send(error.message);
        });
    });

    routes.use('/webhooks/:publisherId/:botId/:channel', (req, res, next) => {
        const { channel } = req.params;
        reportDebug('server-routes');
        reportDebug('channel: ', channel);
        reportDebug('publisherId: ', req.params.publisherId);
        reportDebug('botId: ', req.params.botId);

        if (!webhooks[channel]) {
            return next(new Error(`Unknown channel: ${channel}`));
        }

        webhooks[channel](req, res)
            .then(() => {
                reportDebug(`The webhook of ${channel} completed successfully`);
            })
            .catch(error => {
                reportError(`The webhook of ${channel} failed with error: `, error);
            });
    });

    routes.post('/run-periodic-tasks', (req, res, next) => {
        periodicTasksUpdate(req, res);
    });

    routes.use('/', (req, res, next) => {
        reportDebug('server-router: /, cookies: ', req.cookies);
        render(!req.cookies.signedIn, req, res, next);
    });


    const wss = new WebSocketServer({ server });

    wss.on('connection', function (ws) {
        reportDebug('Conversation on web channel initialized (server side).');

        ws.on('message', function incoming(message) {
            try {
                reportDebug('Websocket message received', message);
                message = JSON.parse(message);
                websocketMessage(message, ws);
            } catch (e) {
                reportError('Error processing websocket message: ', e.message);
            }
        });

        ws.on('close', function close() {
            reportDebug('Conversation on web channel ended (server side).');
        });
    });


    return routes;
}
