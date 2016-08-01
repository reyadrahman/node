const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
//const mapKeys = require('lodash/mapKeys');
const _ = require('lodash');
const { updateEnv, createBaseConfig } = require('./webpack-config-base.js');

const INCLUDE_MODULES = ['normalize.css'];

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return !_.includes(INCLUDE_MODULES, x) && !_.includes(['.bin']);
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const dotenv = require('dotenv').config({
  silent: true,
  path: './.env',
}) || {};
const extraEnv = { PLATFORM: 'node' };
const env = updateEnv(Object.assign({}, dotenv, extraEnv));
const baseConfig = createBaseConfig(env);

module.exports = Object.assign({}, baseConfig, {
    resolve: Object.assign({}, baseConfig.resolve, {
        extensions: ['', '.js', '.jsx']
    }),
    entry: [
        './src/preamble.js',
        'babel-polyfill',
        './src/server/server.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-server'),
        filename: 'bundle.js',
        publicPath: env.PUBLIC_URL,
    },
    externals: nodeModules,
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    // plugins: [ ].concat(baseConfig.plugins),
});
