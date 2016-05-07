require('babel-polyfill');

console.log('!!!! PLATFORM: ', process.env.PLATFORM);
console.log('!!!! process.env.NODE_ENV: ', process.env.NODE_ENV);


if (process.env.NODE_ENV !== 'production') {
    console.log('registering source-map-support');
    require('source-map-support').install();
}

import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import compression from 'compression';
import router from './server-router.js';
var debug = require('debug')('app:server');

//debug('__dirname', __dirname);
var ROOT_DIR = path.join(__dirname, '../');


debug(`running server in ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} mode`);
debug(`PUBLIC_PATH: `, JSON.stringify(process.env.PUBLIC_PATH));
debug(`PUBLIC_URL: `, JSON.stringify(process.env.PUBLIC_URL));

var app = express();

// TODO don't do compression in node.js. Let a reverse proxy take care of compression
app.use(compression());

// view engine setup
debug('views directory: ', path.join(ROOT_DIR, 'src/views'));
app.set('views', path.join(ROOT_DIR, 'src/views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(`/${process.env.PUBLIC_PATH}`, express.static(path.join(ROOT_DIR, 'dist-client'), {
    maxage: '1d'
}));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV !== 'production') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    debug('ERROR: ', err.message);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



/**
 * Get port from environment and store in Express.
 */

app.set('port', process.env.SERVER_PORT);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(process.env.SERVER_PORT);
server.on('error', onError);
server.on('listening', onListening);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

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

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
