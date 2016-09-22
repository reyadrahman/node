/* @flow */

import express from 'express';
import render from './server-side-rendering.js';
import bridge from './client-server-bridge.js';
import { webhooks } from './channels/all-channels.js';
import { feedsPeriodicUpdate } from './periodic-tasks.js';
import { Server as WebSocketServer } from 'ws';

export function initializeRoutes(app) {
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
        feedsPeriodicUpdate(req, res);
    });

    routes.use('/', (req, res, next) => {
        console.log('server-router: /, cookies: ', req.cookies);
        render(!req.cookies.signedIn, req, res, next);
    });

    app.use('/', routes);
    return new WebSocketServer({ server: app });
}
