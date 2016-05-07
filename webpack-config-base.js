var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var GLOBALS = {};
var configArgIndex = process.argv.indexOf('--env');
if (configArgIndex === -1 || configArgIndex+1 >= process.argv.length) {
    console.error('ERROR: Please provide a config file using the --env parameter');
    process.exit(1)
}

var GLOBALS = require('./' + process.argv[configArgIndex+1]);

const PROCESS_ENV_GLOBALS = {};
Object.keys(GLOBALS.common).forEach(k => {
    PROCESS_ENV_GLOBALS['process.env.' + k] = JSON.stringify(GLOBALS.common[k]);
});

const DEV = GLOBALS.NODE_ENV === 'development';

var extractCSS = new ExtractTextPlugin('style.css');

config = {
    // or devtool: 'eval' to debug issues with compiled output:
    devtool: DEV ? 'cheap-module-eval-source-map' : false,
    resolve: {
        modulesDirectories: ['node_modules', 'external_modules'],
    },
    plugins: [
        extractCSS,
        new webpack.DefinePlugin(PROCESS_ENV_GLOBALS),
        //new webpack.HotModuleReplacementPlugin(),
        //new webpack.NoErrorsPlugin()
    ].concat(!DEV ? [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: GLOBALS.common.VERBOSE,
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

module.exports = {
    config,
    GLOBALS,
};
