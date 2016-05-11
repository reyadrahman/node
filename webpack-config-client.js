const path = require('path');
const webpack = require('webpack');

const base = require('./webpack-config-base.js');

const envVars = Object.assign({}, base.envVars, { PLATFORM: 'browser' });
const envVarDefs = base.createEnvVarDefs(envVars);

console.log('envVarDefs: ', envVarDefs);

const config = Object.assign({}, base.config, {
    resolve: Object.assign({}, base.config.resolve, {
        extensions: ['', '.web.js', '.js', '.jsx']
    }),
    entry: [
        // necessary for hot reloading with IE:
        // 'eventsource-polyfill',
        // listen to code updates emitted by hot middleware:
        // 'webpack-hot-middleware/client',
        // your code:
        './src/client/client.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-client'),
        filename: 'bundle.js',
        publicPath: envVars.PUBLIC_URL,
    },
    plugins: [
        new webpack.DefinePlugin(envVarDefs),
    ].concat(base.config.plugins),
});


module.exports = config;
