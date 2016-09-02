/* @flow */

import express from 'express';
import render from './server-side-rendering.js';
import bridge from './client-server-bridge.js';
import { webhooks } from './channels/all-channels.js';

const routes = express.Router();

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

routes.use('/api', bridge);

routes.use('/', (req, res, next) => {
    console.log('server-router: /');

    //res.render('index');

    console.log('server-router: cookies: ', req.cookies);

    if (req.cookies.loggedIn) {
        render(false, req, res, next);
    } else {
        render(true, req, res, next);
    }

});


export default routes;
