import express from 'express';
import render from './server-side-rendering.js';
import sparkWebhook from './spark-webhook/spark-webhook.js';
import messengerWebhook from './messenger-webhook/messenger-webhook.js';
import msWebhook from './ms-webhook/ms-webhook.js';

const routes = express.Router();

const serviceHandlers = {
    spark: sparkWebhook,
    messenger: messengerWebhook,
    ms: msWebhook,
};

routes.use('/webhooks/:publisherId/:botId/:sourceService', (req, res, next) => {
    const { sourceService } = req.params;
    console.log('server-routes');
    console.log('sourceService: ', sourceService);
    console.log('publisherId: ', req.params.publisherId);
    console.log('botId: ', req.params.botId);

    if (!serviceHandlers[sourceService]) {
        return next(new Error(`Unknown source service: ${sourceService}`));
    }

    serviceHandlers[sourceService](req, res);
});

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
