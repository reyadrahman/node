// set environment variables injected by the server
const envVars = JSON.parse(document.getElementById('envVars').innerHTML);
console.log('envVars', envVars);
window.process = {
    env: envVars,
};

console.log('process.env', process.env);

function main() {
    require('../client/client-router.jsx');


}

window.onload = main;
