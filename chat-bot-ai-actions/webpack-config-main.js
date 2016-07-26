const envDefs = require('dotenv').config({
    silent: true,
    path: './.env',
}) || {};
module.exports = require('./webpack-config-base.js')(envDefs);
