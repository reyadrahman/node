/* @flow */

import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import http from 'http';
import routes from './server-routes.js';
import { initResources } from './lib/aws.js';

const PORT = process.env.PORT || 3000;
const DEV = process.env.NODE_ENV === 'development';

var app = express();

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


if (DEV) {
    var allReqs = [];

    app.use((req, res, next) => {
        if (req.originalUrl !== '/reqs' && req.originalUrl !== '/favicon.ico') {
            allReqs.unshift({
                time: new Date().toISOString(),
                method: req.method,
                url: req.originalUrl,
                protocol: req.protocol,
                headers: req.headers,
                body: req.body,
            });
            if (allReqs.length > 30) {
                allReqs.length = 30;
            }
        }
        next();
    });
    app.use('/reqs', (req, res, next) => {
        res.send(`<html><body><pre>\n` +
                 JSON.stringify(allReqs, null, ' ') +
                 `\n</pre></body></html>`);
    });
}

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    // $FlowFixMe
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV !== 'production') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        // $FlowFixMe
        console.error('ERROR: ', err.message);
        res.render('error', {
            // $FlowFixMe
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
        // $FlowFixMe
        message: err.message,
        error: {}
    });
});



/**
 * Get port from environment and store in Express.
 */

app.set('port', PORT);

/**
 * Create HTTP server.
 */

// $FlowFixMe
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

console.log('Initializing resources...');
initResources(5, 5).then(() => {
    console.log('Successfully initialized resources');
    server.listen(PORT);
    server.on('error', onError);
    server.on('listening', onListening);

}).catch(err => {
    console.error('Failed initializing resources: ', err);
})



/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof PORT === 'string'
    ? 'Pipe ' + PORT
    : 'Port ' + PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
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
  console.log('Listening on ' + bind);
}








//
//
// var port = process.env.PORT || 3000,
//     http = require('http'),
//     fs = require('fs'),
//     html = fs.readFileSync('index.html');
//
// var log = function(entry) {
//     fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
// };
//
// var server = http.createServer(function (req, res) {
//     if (req.method === 'POST') {
//         var body = '';
//
//         req.on('data', function(chunk) {
//             body += chunk;
//         });
//
//         req.on('end', function() {
//             if (req.url === '/') {
//                 log('Received message: ' + body);
//             } else if (req.url = '/scheduled') {
//                 log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
//             }
//
//             res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
//             res.end();
//         });
//     } else {
//         res.writeHead(200);
//         res.write(html);
//         res.end();
//     }
// });
//
// // Listen on port 3000, IP defaults to 127.0.0.1
// server.listen(port);
//
// // Put a friendly message on the terminal
// console.log('Server running at http://127.0.0.1:' + port + '/');
