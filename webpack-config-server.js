const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
//const mapKeys = require('lodash/mapKeys');
const _ = require('lodash');
const { createBaseConfig, createPublicPathAndUrl } = require('./webpack-config-base.js');

const INCLUDE_MODULES = ['normalize.css'];

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return !_.includes(INCLUDE_MODULES, x) && !_.includes(['.bin']);
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });


/*
    Environment Variables:
    process.env takes precedence. Then .env file and finally the default values.
*/

const dotEnv = require('dotenv').config({
    silent: true,
}) || {};

const defaultEnv = {
    NODE_ENV: 'production',
    PLATFORM: 'node',
    PORT: 3000,
    DEBUG: 'app:*',
};


const publicPathAndUrlEnv = createPublicPathAndUrl(process.env.CDN, process.env.TIMESTAMP);
_.defaults(process.env, defaultEnv, publicPathAndUrlEnv);
console.log('!!! after defaults process.env: ', process.env);


const defKeys = _.union(_.keys(dotEnv), _.keys(defaultEnv), _.keys(publicPathAndUrlEnv));
const defs = _.pick(process.env, defKeys);

console.error('defs: ', defs);

const baseConfig = createBaseConfig(process.env.NODE_ENV);

module.exports = Object.assign({}, baseConfig, {
    resolve: Object.assign({}, baseConfig.resolve, {
        extensions: ['', '.js', '.jsx']
    }),
    entry: [
        './src/server/preamble.js',
        'babel-polyfill',
        './src/server/server.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-server'),
        filename: 'bundle.js',
        publicPath: process.env.PUBLIC_URL,
    },
    externals: nodeModules,
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: [
        new webpack.DefinePlugin({ '__ENV_VARS__': JSON.stringify(defs) }),
    ].concat(baseConfig.plugins),
});