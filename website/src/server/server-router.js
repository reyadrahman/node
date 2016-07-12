import express from 'express';
import render from './server-side-rendering.js';

const routes = express.Router();

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
