var path = require('path');
var webpack = require('webpack');

var base = require('./webpack-config-base.js');

const PROCESS_ENV_GLOBALS = {};
Object.keys(base.GLOBALS.client).forEach(k => {
    PROCESS_ENV_GLOBALS['process.env.' + k] = JSON.stringify(base.GLOBALS.client[k]);
});

const PUBLIC_URL = base.GLOBALS.common.PUBLIC_URL;

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
        publicPath: `${PUBLIC_URL}/`
    },
    plugins: base.config.plugins.concat([
        new webpack.DefinePlugin(PROCESS_ENV_GLOBALS),
    ])
});


module.exports = config;
