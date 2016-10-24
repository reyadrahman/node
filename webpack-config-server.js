const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
//const mapKeys = require('lodash/mapKeys');
const _ = require('lodash');
const { createBaseConfig, createPublicPathAndUrl } = require('./webpack-config-base.js');

const VALID_ENV_VARS = [
    { name: 'NODE_ENV',                       required: false },
    { name: 'AWS_REGION',                     required: true  },
    { name: 'AWS_ACCESS_KEY_ID',              required: true  },
    { name: 'AWS_SECRET_ACCESS_KEY',          required: true  },
    { name: 'DB_TABLES_PREFIX',               required: false },
    { name: 'S3_BUCKET_NAME',                 required: true  },
    { name: 'IDENTITY_POOL_ID',               required: true  },
    { name: 'IDENTITY_POOL_UNAUTH_ROLE_ARN',  required: true  },
    { name: 'IDENTITY_POOL_AUTH_ROLE_ARN',    required: true  },
    { name: 'USER_POOL_ID',                   required: true  },
    { name: 'USER_POOL_APP_CLIENT_ID',        required: true  },
    { name: 'CONTACT_EMAIL',                  required: true  },
    { name: 'EMAIL_ACTION_FROM_ADDRESS',      required: true  },
    { name: 'OWN_BASE_URL',                   required: true  },
    { name: 'CONVERSATIONAL_ENGINE_LAMBDA',   required: true  },
    { name: 'CALL_SERVER_LAMBDA_SECRET',      required: true  },
    { name: 'CDN',                            required: false },
    { name: 'PORT',                           required: false },
    { name: 'DEBUG',                          required: false },
];

const INCLUDE_MODULES = ['normalize.css'];

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return !_.includes(INCLUDE_MODULES, x) && !_.includes(['.bin']);
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });


/*
    Environment Variables:
    process.env takes precedence. Then .env file and finally the default values.
    We insert all environment variable into __ENV_VARS__ which will then
    be read by the server and assigned to process.env. Except for
    process.env.NODE_ENV which will be hard coded because UglifyJsPlugin
    uses it to eliminate dead-code.
*/

const dotEnv = require('dotenv').config({
    silent: true,
}) || {};

const defaultEnv = {
    NODE_ENV: 'production',
    PLATFORM: 'node',
    PORT: 3000,
    DEBUG: 'deepiks:*',
};


const publicPathAndUrlEnv = createPublicPathAndUrl(process.env.CDN, process.env.TIMESTAMP);
_.defaults(process.env, defaultEnv, publicPathAndUrlEnv);
const missingEnvVars = VALID_ENV_VARS.filter(x => x.required && !process.env[x.name]);
if (!_.isEmpty(missingEnvVars)) {
    console.error('\n\nThe following environment variables are missing:');
    missingEnvVars.forEach(x => console.error('\t' + x.name));
    process.exit(1);
}

const defKeys = _.union(_.keys(dotEnv), _.keys(defaultEnv), _.keys(publicPathAndUrlEnv));
const defs = _.pick(process.env, defKeys);

// console.error('defs: ', defs);

const baseConfig = createBaseConfig(process.env.NODE_ENV);

module.exports = Object.assign({}, baseConfig, {
    resolve: Object.assign({}, baseConfig.resolve, {
        extensions: ['', '.js', '.jsx']
    }),
    entry: [
        './src/server/preamble.js',
        'babel-polyfill',
        './src/server/server.js'
    ],
    output: {
        path: path.join(__dirname, 'dist-server'),
        filename: 'bundle.js',
        publicPath: process.env.PUBLIC_URL,
    },
    module: Object.assign({}, baseConfig.module, {
        loaders: [
            {
                test: /\.scss$/i,
                loader: 'null',
            },
            {
                test: /\.less$/i,
                loader: 'null',
            },

            {
                test: /\.css$/,
                loader: 'null',
            },
        ].concat(baseConfig.module.loaders),
    }),
    externals: nodeModules,
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            '__ENV_VARS__': JSON.stringify(defs),
        }),
    ].concat(baseConfig.plugins),
});
