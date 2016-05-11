const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pick = require('lodash/pick');
const map = require('lodash/map');
const fromPairs = require('lodash/fromPairs');

function createEnvVarDefs(envVars) {
    return fromPairs(map(envVars, (v, k) =>
        [`process.env.${k}`, JSON.stringify(v)]));
}

const DEFAULT_ENV_VARS = {
    NODE_ENV: 'development',
    VERBOSE: false,
    SERVER_PORT: 3000,
    CDN: '',
    DEBUG: 'app:*',
    TIMESTAMP: '',
};

const envArgIndex = process.argv.indexOf('--env');
const envFileProvided = envArgIndex !== -1 && envArgIndex+1 < process.argv.length;
const envFileContent = envFileProvided
    ? require(`./${process.argv[envArgIndex + 1]}`)
    : {};

const providedEnvVars = pick(process.env, Object.keys(DEFAULT_ENV_VARS));

console.log('DEFAULT_ENV_VARS: ', DEFAULT_ENV_VARS);
console.log('envFileContent', envFileContent);
console.log('providedEnvVars', providedEnvVars);

const envVars = Object.assign({}, DEFAULT_ENV_VARS, envFileContent, providedEnvVars);
envVars.VERBOSE = !envVars.VERBOSE ? false : Boolean(JSON.parse(envVars.VERBOSE));

if (envVars.CDN && !envVars.TIMESTAMP) {
    console.error('Please use the scripts/build-all.sh to build when using CDN.');
    process.exit(-1);
}

if (envVars.CDN) {
    envVars.PUBLIC_PATH = `/dist_${envVars.TIMESTAMP}/`;
    envVars.PUBLIC_URL = `${envVars.CDN}/dist_${envVars.TIMESTAMP}/`;
} else {
    envVars.PUBLIC_PATH = '/dist/';
    envVars.PUBLIC_URL = '/dist/';
}

    //     PUBLIC_DOMAIN: 'http://d2lwos3jzc4ewy.cloudfront.net',
    //     PUBLIC_PATH: 'dist_' + PUBLIC_PATH_SUFFIX + '/',
    //     PUBLIC_URL: 'http://d2lwos3jzc4ewy.cloudfront.net/dist_' + PUBLIC_PATH_SUFFIX + '/',
    //     */
    //     PUBLIC_DOMAIN: '',
    //     PUBLIC_PATH: '/dist',
    //     PUBLIC_URL: '/dist',



const DEV = envVars.NODE_ENV === 'development';

const extractCSS = new ExtractTextPlugin('style.css');

const config = {
    // or devtool: 'eval' to debug issues with compiled output:
    devtool: DEV ? 'cheap-module-eval-source-map' : false,
    resolve: {
        modulesDirectories: ['node_modules', 'external_modules'],
    },
    plugins: [
        //new webpack.DefinePlugin(envVarDefs),
        extractCSS,
        //new webpack.HotModuleReplacementPlugin(),
        //new webpack.NoErrorsPlugin()
    ].concat(!DEV ? [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: envVars.VERBOSE,
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
    envVars,
    createEnvVarDefs,
};
