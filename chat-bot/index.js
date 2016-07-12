require('./dotenv.js')(require('./.env'));
if (process.env.NODE_ENV !== 'development') {
    process.env.NODE_ENV = 'production';
}

require('./src/server.js');
