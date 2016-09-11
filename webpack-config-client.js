const { createBaseConfig, createPublicPathAndUrl } = require('./webpack-config-base.js');
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');


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
    entry: {
        landingPage: ['babel-polyfill', 'whatwg-fetch', './src/client/apps/landing-page/landing-page-entry.js'],
        admin: ['babel-polyfill', 'whatwg-fetch', './src/client/apps/admin/admin-entry.js'],
    },
    output: {
        path: path.join(__dirname, 'dist-client'),
        filename: '[name].js',
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
        new webpack.DefinePlugin({
            'process.env': 'window.process.env',
        }),
        new CopyWebpackPlugin([
            {
                from: 'src/client/apps/landing-page/public',
                to: 'landing-page',
            },
            {
                from: 'src/client/apps/admin/public',
                to: 'admin',
            }
        ], {
            ignore: [
                '.*', // ignore dot files
            ],
        }),
        new webpack.ProvidePlugin({
            // Make $ and jQuery available in every module without writing require("jquery")
            $: "jquery",
            jQuery: "jquery",
        }),
        new CommonsChunkPlugin("commons.js"),
    ].concat(baseConfig.plugins),

    externals: {
        // require("jquery") is external and available on the global var jQuery
        "jquery": "jQuery",
    }
});
