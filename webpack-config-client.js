var path = require('path');
var webpack = require('webpack');

var base = require('./webpack-config-base.js');

var config = Object.assign({}, base.config, {
    entry: [
        // necessary for hot reloading with IE:
        //'eventsource-polyfill',
        // listen to code updates emitted by hot middleware:
        //'webpack-hot-middleware/client',
        // your code:
        './src/client/client.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-client'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
});


module.exports = config;
