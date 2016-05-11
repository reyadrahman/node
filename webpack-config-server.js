const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const mapKeys = require('lodash/mapKeys');
const base = require('./webpack-config-base.js');

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin', 'normalize.css'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });


const envVars = Object.assign({}, base.envVars, { PLATFORM: 'node' });
const envVarDefs = base.createEnvVarDefs(envVars);

console.log('envVarDefs: ', envVarDefs);

const config = Object.assign({}, base.config, {
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
        publicPath: envVars.PUBLIC_URL,
    },
    externals: nodeModules,
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: [
        new webpack.DefinePlugin(envVarDefs),
    ].concat(base.config.plugins),
});


module.exports = config;
