/* @flow */

import express from 'express';
import bridge from './client-server-bridge.js';
import { webhooks } from './channels/all-channels.js';
import { feedsPeriodicUpdate } from './periodic-tasks.js';
import websiteMiddleware from './website-middleware.js';

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

routes.use('/', websiteMiddleware);

export default routes;
