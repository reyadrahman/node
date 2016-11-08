/* @flow */

import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import compression from 'compression';
import { initResources } from '../aws/aws.js';
import { CONSTANTS } from './server-utils.js';
import initializeRoutes from './server-router.js';
const reportDebug = require('debug')('deepiks:server');
const reportError = require('debug')('deepiks:server:error');

const ROOT_DIR = path.join(__dirname, '../');

const DEV = process.env.NODE_ENV === 'development';


reportDebug(`running server in ${DEV ? 'development' : 'production'} mode`);

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(compression());

app.use(logger('short'));
// save raw body and then parse as json
app.use(bodyParser.json({
    verify: (req, res, buf) => req.rawBody = buf
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(CONSTANTS.PUBLIC_PATH, express.static(path.join(ROOT_DIR, 'dist-client'),
    DEV ? {} : { maxage: '1d' }));

app.use(initializeRoutes(server));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  // $FlowFixMe
  err.status = 404;
  next(err);
});

// error handlers

app.use(function(err, req, res, next) {
    reportError(err);
    res.status(err.status || 500);
    res.send(`<h1>Error ${err.status || 500}</h1><h3>${err.message || ''}</h3>`);
});

reportDebug('Initializing resources...');
initResources(5, 5).then(() => {
    reportDebug('Successfully initialized resources');
    server.listen(parseInt(CONSTANTS.PORT));
    server.on('error', onError);
    server.on('listening', () => {
        reportDebug(`Listening on ${CONSTANTS.PORT}`);
    });

}).catch(err => {
    reportError('Failed initializing resources: ', err);
});


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = `Port ${CONSTANTS.PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      reportDebug(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      reportDebug(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
