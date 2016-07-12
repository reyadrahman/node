require('./dotenv.js')();
const DEV = process.env.NODE_ENV === 'development';
if (!DEV) {
    process.env.NODE_ENV = 'production';
}

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const _ = require('lodash');


const config = {
    entry: ['babel-polyfill', './index.js'],

    output: {
        path: 'dist',
        filename: 'index.js',
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    externals: [
        nodeExternals(),
    ],

    // devtool: DEV ? 'source-map' : false,
    plugins: [

    ].concat(!DEV ? [
        // new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
    ] : []),
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                include: path.join(__dirname, 'src'),
                // include: __dirname,
                query: {
                    presets: ['es2015', 'stage-0'],
                    plugins: [
                        'transform-flow-strip-types',
                    ].concat(DEV ? [
                        // 'rewire',
                    ] : [])
                },
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.env$/,
                loader: 'raw-loader',
            }
        ],
    },
};

module.exports = config;
