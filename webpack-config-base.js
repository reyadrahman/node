const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const _ = require('lodash');
const autoprefixer = require('autoprefixer');

const defaultEnv = {
    NODE_ENV: 'production',
    PORT: 3000,
    DEBUG: 'app:*',
};

const extractCSS = new ExtractTextPlugin('style.css');

function updateEnv(extraEnv) {

    const env = Object.assign({}, defaultEnv, extraEnv);
    if (env.CDN && !env.TIMESTAMP) {
        console.error('Please use the scripts/build.sh to build when using CDN.');
        process.exit(1);
    }
    if (env.CDN) {
        env.PUBLIC_PATH = `/dist_${env.TIMESTAMP}/`;
        env.PUBLIC_URL = `${env.CDN}/dist_${env.TIMESTAMP}/`;
    } else {
        env.PUBLIC_PATH = '/dist/';
        env.PUBLIC_URL = '/dist/';
    }

    // process.env takes precedence
    Object.assign(env, _.pick(process.env, _.keys(env)));
    Object.assign(process.env, env);
    return env;
}

function createBaseConfig(env) {
    const DEV = env.NODE_ENV === 'development';

    return {
        // or devtool: 'eval' to debug issues with compiled output:
        devtool: DEV ? 'cheap-module-eval-source-map' : false,
        resolve: {
            modulesDirectories: ['node_modules', 'external_modules'],
        },
        plugins: [
            new webpack.DefinePlugin({ '__dotEnvObj__': JSON.stringify(env) }),
            extractCSS,
            //new webpack.HotModuleReplacementPlugin(),
            //new webpack.NoErrorsPlugin()
        ].concat(!DEV ? [
            // new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    screw_ie8: true,
                    warnings: false,
                },
            }),
            new webpack.optimize.AggressiveMergingPlugin(),
        ] : []),
        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    loader: 'babel',
                    include: path.join(__dirname, 'src'),
                    query: {
                        presets: ['es2015', 'react', 'stage-0'],
                        plugins: [
                            'transform-flow-strip-types',
                        ].concat(DEV ? [
                            // 'rewire',
                        ] : [])
                    },
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
                        'postcss',
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
                    test: /\.(png|jpg|mp4|eot|woff|woff2|ttf|svg)/,
                    loader: "url-loader?limit=1024"
                }
            ],
            /*
            noParse: [
                path.join(__dirname, "external_modules") + '.*',
            ],
            */
        },
        postcss: function() {
            return [autoprefixer({
                browsers: ['last 3 version'],
            })];
        }
    };
};

module.exports = {
    updateEnv,
    createBaseConfig,
};
