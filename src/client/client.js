// set environment variables injected by the server
const envVars = JSON.parse(document.getElementById('envVars').innerHTML);
window.process = {
    env: envVars,
};


// setup debug.js
localStorage.debug = process.env.DEBUG;
const reportDebug = require('debug')('deepiks:client');

reportDebug('envVars', envVars);
reportDebug('process.env', process.env);

function main() {
    require('../client/client-router.jsx');


}

window.onload = main;
