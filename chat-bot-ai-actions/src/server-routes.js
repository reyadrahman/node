/* @flow */

import express from 'express';

const routes = express.Router();

const handlers = {
    getForecast: require('./actions/get-forecast.js').default,
    gotAttachment: require('./actions/got-attachment.js').default,
    findSimilarImages: require('./actions/find-similar-images.js').default,
    applyEffect: require('./actions/apply-effect.js').default,
};

routes.post('/', (req, res, next) => {
    console.log('in server-routes: req.body: ', req.body);
    if (!req.body || !req.body.action || !handlers[req.body.action]) {
        return next();
    }
    const { action, ...requestData } = req.body;
    handlers[action](requestData).then(result => {
        res.json(result);
    }).catch(err => {
        console.error(err);
        res.statusCode(500).send();
    })
});


export default routes;
