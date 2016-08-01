const path = require('path');
const webpack = require('webpack');
const { updateEnv, createBaseConfig } = require('./webpack-config-base.js');
const _ = require('lodash');

const dotenv = require('dotenv').config({
    silent: true,
    path: './.env',
}) || {};
const extraEnv = { PLATFORM: 'browser' };
const env = updateEnv(Object.assign({}, dotenv, extraEnv));
const baseConfig = createBaseConfig(env);


module.exports = Object.assign({}, baseConfig, {
    resolve: Object.assign({}, baseConfig.resolve, {
        extensions: ['', '.web.js', '.js', '.jsx']
    }),
    entry: [
        './src/preamble.js',
        'babel-polyfill',
        './src/client/client.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-client'),
        filename: 'bundle.js',
        publicPath: env.PUBLIC_URL,
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
    // plugins: [ ].concat(baseConfig.plugins),
});
