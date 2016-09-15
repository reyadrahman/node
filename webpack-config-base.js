const path = require('path');
const webpack = require('webpack');
const _ = require('lodash');


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
        devtool: DEV ? 'inline-source-map' : false,
        resolve: {
            modulesDirectories: ['node_modules', 'external_modules'],
        },
        plugins: [
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
                    test: /\.js$/,
                    loader: 'babel',
                    include: path.join(__dirname, 'src'),
                    query: {
                        presets: [
                            'stage-0',
                        ],

                        plugins: [
                            'transform-flow-strip-types',
                            // the rest is the same as babel-preset-es2015 except
                            // for the config of transform-es2015-modules-commonjs
                            // and transform-regenerator
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
                            'transform-regenerator'
                        ],
                    },
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader',
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
    };
};

module.exports = {
    createBaseConfig,
    createPublicPathAndUrl,
};
