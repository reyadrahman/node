import express from 'express';
import ssRender from './server-side-rendering.js';

const routes = express.Router();

routes.use('/', (req, res, next) => {
  //res.render('index');
    /*
    let html = '<!doctype html>\n' + ssRender(req);
    res.status(200).send(html);
    */
    ssRender(req, res, next);
});


export default routes;
