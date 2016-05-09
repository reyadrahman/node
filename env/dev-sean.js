const PUBLIC_PATH_SUFFIX = process.env.TIMESTAMP;
module.exports = {
    common: {
        NODE_ENV: 'development',
        VERBOSE: false,
        SERVER_PORT: 3000,
        DEBUG: 'app:*',

        /*
        PUBLIC_DOMAIN: 'http://d2lwos3jzc4ewy.cloudfront.net',
        PUBLIC_PATH: 'dist_' + PUBLIC_PATH_SUFFIX + '/',
        PUBLIC_URL: 'http://d2lwos3jzc4ewy.cloudfront.net/dist_' + PUBLIC_PATH_SUFFIX + '/',
        */
        PUBLIC_DOMAIN: '',
        PUBLIC_PATH: '/dist',
        PUBLIC_URL: '/dist',

    },
    client: {
        PLATFORM: 'browser',
    },
    server: {
        PLATFORM: 'node',
    }
}
