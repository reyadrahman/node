/* @flow */

// set environment variables injected by the server
export const env = JSON.parse(document.getElementById('envVars').innerHTML);
console.log('env', env);
window.process = {
    env,
};

console.log('process.env', process.env);


export const appState = JSON.parse(document.getElementById('appState').innerHTML);
