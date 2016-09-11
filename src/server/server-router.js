/* @flow */

import express from 'express';
import * as renderer from './server-side-renderer.js';
import bridge from './client-server-bridge.js';
import { webhooks } from './channels/all-channels.js';

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

routes.use('/admin/', (req, res, next) => {
    const doc = renderer.renderAdminApp(req, res, next);
    console.log('route /admin/ sending: ', doc);
    res.send(doc);
});

routes.get('/', (req, res, next) => {
    const doc = renderer.renderLandingPageApp(req, res, next);
    console.log('route / sending: ', doc);
    res.send(doc);
});


export default routes;
