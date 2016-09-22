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
                    test: /\.jsx?$/,
                    loader: 'babel',
                    include: path.join(__dirname, 'src'),
                    query: {
                        presets: ['es2015', 'react', 'stage-0'],
                        plugins: [
                            'transform-flow-strip-types',
                        ].concat(DEV ? [
                            // 'rewire',
                            // [
                            //     "react-transform", {
                            //         "transforms": [
                            //             {
                            //                 "transform": "react-transform-hmr",
                            //                 // if you use React Native, pass "react-native" instead:
                            //                 "imports": ["react"],
                            //                 // this is important for Webpack HMR:
                            //                 "locals": ["module"]
                            //             }
                            //         ]
                            //         // note: you can put more transforms into array
                            //         // this is just one of them!
                            //     }
                            // ]
                        ] : [])
                    },
                },
                {
                    test: /\.json$/,
                    loader: "json-loader",
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
