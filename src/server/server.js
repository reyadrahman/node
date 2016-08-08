/* @flow */

console.log('PLATFORM: ', process.env.PLATFORM);
console.log('NODE_ENV: ', process.env.NODE_ENV);
console.log('PORT: ', process.env.PORT);

// {
//     const DEV = process.env.NODE_ENV === 'development';
//
//     if (DEV) {
//         console.log('registering source-map-support');
//         require('source-map-support').install();
//     }
// }

import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import compression from 'compression';
import router from './server-router.js';
import { initResources } from '../aws/aws.js';
import { ENV } from './server-utils.js';
const debug = require('debug')('app:server');

const ROOT_DIR = path.join(__dirname, '../');

const { PUBLIC_PATH, PUBLIC_URL, PORT, NODE_ENV } = ENV;

const DEV = NODE_ENV === 'development';


debug(`running server in ${DEV ? 'development' : 'production'} mode`);

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// TODO don't do compression in node.js. Let a reverse proxy take care of compression
app.use(compression());

// view engine setup
debug('views directory: ', path.join(ROOT_DIR, 'src/views'));
app.set('views', path.join(ROOT_DIR, 'src/views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(`${PUBLIC_PATH}`, express.static(path.join(ROOT_DIR, 'dist-client'),
    DEV ? {} : { maxage: '1d' }));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  // $FlowFixMe
  err.status = 404;
  next(err);
});

// error handlers


app.use(function(err, req, res, next) {
    debug(err);
    res.status(err.status || 500);
    res.send(`Error ${err.status || 500}\n\n${err.message || ''}`);
});

const server = http.createServer(app);

debug('Initializing resources...');
initResources(5, 5).then(() => {
    debug('Successfully initialized resources');
    server.listen(parseInt(PORT));
    server.on('error', onError);
    server.on('listening', () => {
        debug(`Listening on ${PORT}`);
    });

}).catch(err => {
    debug('Failed initializing resources: ', err);
})


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = `Port ${PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
