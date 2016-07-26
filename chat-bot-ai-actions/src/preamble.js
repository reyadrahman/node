Object.keys(__dotEnvObj__).forEach(x => {
    if (typeof process.env[x] === 'undefined') {
        process.env[x] = __dotEnvObj__[x];
    }
});
