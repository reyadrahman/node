const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const _ = require('lodash');
const autoprefixer = require('autoprefixer');


const extractCSS = new ExtractTextPlugin('[name].css');

function createPublicPathAndUrl(cdn, timestamp) {
    if (cdn && !timestamp) {
        console.error('Please use the scripts/build.sh to build when using CDN.');
        process.exit(1);
    }
    return {
        PUBLIC_PATH: cdn ? `/dist_${timestamp}/` : '/dist/',
        PUBLIC_URL: cdn ? `${cdn}/dist_${timestamp}/` : '/dist/',
    };
}

function createBaseConfig(NODE_ENV) {
    const DEV = NODE_ENV === 'development';

    return {
        // or devtool: 'eval' to debug issues with compiled output:
        devtool: DEV ? 'cheap-module-eval-source-map' : false,
        resolve: {
            modulesDirectories: ['node_modules', 'external_modules'],
        },
        plugins: [
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
        ] : [
            // new webpack.HotModuleReplacementPlugin(),
            // new webpack.NoErrorsPlugin()
        ]),
        module: {
            loaders: [
                {
                    test: /\.jsx?$/,
                    loader: 'babel',
                    include: path.join(__dirname, 'src'),
                    query: {
                        presets: [
                            'stage-0',
                        ],

                        plugins: [
                            'transform-flow-strip-types',
                            // the rest is the same as babel-preset-es2015
                            // expect for the transform-es2015-modules-commonjs's allowTopLevelThis
                            ['transform-es2015-template-literals', { loose: false, spec: false }],
                            'transform-es2015-literals',
                            'transform-es2015-function-name',
                            ['transform-es2015-arrow-functions', { spec: false }],
                            'transform-es2015-block-scoped-functions',
                            ['transform-es2015-classes', { loose: false }],
                            'transform-es2015-object-super',
                            'transform-es2015-shorthand-properties',
                            'transform-es2015-duplicate-keys',
                            ['transform-es2015-computed-properties', { loose: false }],
                            ['transform-es2015-for-of', { loose: false }],
                            'transform-es2015-sticky-regex',
                            'transform-es2015-unicode-regex',
                            'check-es2015-constants',
                            ['transform-es2015-spread', { loose: false }],
                            'transform-es2015-parameters',
                            ['transform-es2015-destructuring', { loose: false }],
                            'transform-es2015-block-scoping',
                            'transform-es2015-typeof-symbol',
                            // alowTopLevelThis is needed for compatibility with old js files that use
                            // "this" at the top level instead of "window"
                            ['transform-es2015-modules-commonjs', { loose: false, allowTopLevelThis: true }],
                            ['transform-regenerator', { async: false, asyncGenerators: false }]
                        ],
                    },
                },
                {
                    test: /\.json$/,
                    loader: "json-loader"
                },

                // {
                //     test: /\.scss$/,
                //     loader: extractCSS.extract([
                //         'css?importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
                //         'postcss',
                //         // 'resolve-url',
                //         'sass?sourceMap'
                //     ])
                // },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
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
    createBaseConfig,
    createPublicPathAndUrl,
};
