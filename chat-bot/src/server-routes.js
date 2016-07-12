import express from 'express';
import sparkWebhook from './spark-webhook/spark-webhook.js'
import messengerWebhook from './messenger-webhook/messenger-webhook.js'

const routes = express.Router();

routes.use('/webhooks/spark', (req, res, next) => {
    sparkWebhook(req, res);
});

routes.use('/webhooks/messenger', (req, res, next) => {
    messengerWebhook(req, res);
});

routes.use('/', (req, res, next) => {
    res.send('Nothing to see here...');
});


export default routes;
