import express from 'express';
import ssRender from './server-side-rendering.js';

const routes = express.Router();

routes.use('/', (req, res, next) => {
    console.log('server-router: /');

    //res.render('index');

    ssRender(req, res, next);
});


export default routes;
