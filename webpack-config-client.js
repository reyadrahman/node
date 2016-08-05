const path = require('path');
const webpack = require('webpack');
const { createBaseConfig, createPublicPathAndUrl } = require('./webpack-config-base.js');
const _ = require('lodash');

/*
    Environment Variables:
    process.env takes precedence. Then .env file and finally the default values.
    We don't build the environment variables into webpack's output using
    DefinePlugin. All environment variables will be injected into the client
    by the server at run time
*/
require('dotenv').config({
    silent: true,
});
_.defaults(process.env, { NODE_ENV: 'production' });
const { NODE_ENV, CDN, TIMESTAMP } = process.env;
const { PUBLIC_URL } = createPublicPathAndUrl(CDN, TIMESTAMP);
const baseConfig = createBaseConfig(NODE_ENV);


module.exports = Object.assign({}, baseConfig, {
    resolve: Object.assign({}, baseConfig.resolve, {
        extensions: ['', '.web.js', '.js', '.jsx']
    }),
    entry: [
        'babel-polyfill',
        './src/client/client.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-client'),
        filename: 'bundle.js',
        publicPath: PUBLIC_URL,
    },
    node: {
        // console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    },
    module: Object.assign({}, baseConfig.module, {
        noParse: [
            /node_modules\/json-schema\/lib\/validate\.js/,
        ].concat(baseConfig.module.noParse || [])
    }),
    plugins: [
        new webpack.DefinePlugin({ 'process.env': 'window.process.env' }),
    ].concat(baseConfig.plugins),
});
