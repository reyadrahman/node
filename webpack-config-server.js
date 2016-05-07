var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var base = require('./webpack-config-base.js');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin', 'normalize.css'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const PROCESS_ENV_GLOBALS = {};
Object.keys(base.GLOBALS.server).forEach(k => {
    PROCESS_ENV_GLOBALS['process.env.' + k] = JSON.stringify(base.GLOBALS.server[k]);
});


const PUBLIC_URL = base.GLOBALS.common.PUBLIC_URL;

var config = Object.assign({}, base.config, {
    resolve: Object.assign({}, base.config.resolve, {
        extensions: ['', '.js', '.jsx']
    }),
    entry: [
        // necessary for hot reloading with IE:
        //'eventsource-polyfill',
        // listen to code updates emitted by hot middleware:
        //'webpack-hot-middleware/client',
        // your code:
        './src/server/server.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-server'),
        filename: 'bundle.js',
        publicPath: PUBLIC_URL.match(/^https?:\/\//)
            ? `${PUBLIC_URL}/` : `/${PUBLIC_URL}/`,
    },
    externals: nodeModules,
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: base.config.plugins.concat([
        new webpack.DefinePlugin(PROCESS_ENV_GLOBALS),
    ]),
});


module.exports = config;
