var path = require('path');
var webpack = require('webpack');

const DEV = process.env.NODE_ENV !== 'production';
const VERBOSE = process.env.VERBOSE;

const GLOBALS = {
  'process.env.NODE_ENV': DEV ? '"development"' : '"production"',
  'process.env.WEBSITE_HOSTNAME': `"${process.env.WEBSITE_HOSTNAME || ''}"`,
};

config = {
  // or devtool: 'eval' to debug issues with compiled output:
  devtool: DEV ? 'cheap-module-eval-source-map' : false,
  entry: [
    // necessary for hot reloading with IE:
    //'eventsource-polyfill',
    // listen to code updates emitted by hot middleware:
    //'webpack-hot-middleware/client',
    // your code:
    './src/client.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    //new webpack.HotModuleReplacementPlugin(),
    //new webpack.NoErrorsPlugin()

    ...(!DEV ? [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: VERBOSE,
        },
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
    ] : []),
  ],
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
      }
    ]
  }
};

module.exports = config;
