var path = require('path');
var webpack = require('webpack');

var base = require('./webpack-config-base.js');

const GLOBALS = {
    PLATFORM: '"browser"',
}

var config = Object.assign({}, base.config, {
    resolve: Object.assign({}, base.config.resolve, {
        extensions: ['', '.web.js', '.js', '.jsx']
    }),
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
    plugins: base.config.plugins.concat([
        new webpack.DefinePlugin(GLOBALS),
    ])
});


module.exports = config;
