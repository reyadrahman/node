var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const DEV = process.env.NODE_ENV !== 'production';
const VERBOSE = process.env.VERBOSE;

const GLOBALS = {
    'process.env.NODE_ENV': DEV ? '"development"' : '"production"',
    'process.env.WEBSITE_HOSTNAME': `"${process.env.WEBSITE_HOSTNAME || ''}"`,
};

var extractCSS = new ExtractTextPlugin('style.css');

config = {
    // or devtool: 'eval' to debug issues with compiled output:
    devtool: DEV ? 'cheap-module-eval-source-map' : false,
    resolve: {
        modulesDirectories: ['node_modules', 'external_modules'],
    },
    plugins: [
        extractCSS,
        new webpack.DefinePlugin(GLOBALS),
        //new webpack.HotModuleReplacementPlugin(),
        //new webpack.NoErrorsPlugin()
    ].concat(!DEV ? [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: VERBOSE,
            },
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
    ] : []),
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },

            {
                // NOTE scss files use modules but css files don't
                test: /\.scss$/,
                loader: extractCSS.extract([
                    'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
                    'resolve-url',
                    'sass?sourceMap'
                ])
            },
            {
                // NOTE scss files use modules but css files don't
                test: /\.css$/,
                loader: extractCSS.extract([
                    'css?importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
                    'resolve-url',
                ])
            },
            {
                test: /\.(png|jpg|mp4)$/,
                loader: "url-loader?limit=1024"
            }
        ],
        /*
        noParse: [
            path.join(__dirname, "external_modules") + '.*',
        ],
        */
    }
};

module.exports = {DEV, VERBOSE, config};
