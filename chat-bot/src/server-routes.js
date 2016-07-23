/* @flow */

import express from 'express';
import sparkWebhook from './spark-webhook/spark-webhook.js'
import messengerWebhook from './messenger-webhook/messenger-webhook.js'
import msWebhook from './ms-webhook/ms-webhook.js'

const routes = express.Router();

const serviceHandlers = {
    spark: sparkWebhook,
    messenger: messengerWebhook,
    ms: msWebhook,
};

routes.use('/webhooks/:botId/:sourceService', (req, res, next) => {
    const { sourceService } = req.params;
    console.log('server-routes');
    console.log('sourceService: ', sourceService);
    console.log('botId: ', req.params.botId);
    if (!serviceHandlers[sourceService]) {
        return next();
    }

    serviceHandlers[sourceService](req, res);
});

routes.use('/', (req, res, next) => {
    //res.status(404).send('Nothing to see here...');
    next();
});


export default routes;
