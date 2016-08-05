Object.keys(__ENV_VARS__).forEach(x => {
    if (typeof process.env[x] === 'undefined') {
        process.env[x] = __ENV_VARS__[x];
    }
});

console.log('process.env: ', process.env);

//Promise.done is non-standard but some modules depend on it
if (typeof Promise.prototype.done !== 'function') {
  Promise.prototype.done = function (onFulfilled, onRejected) {
    var self = arguments.length ? this.then.apply(this, arguments) : this
    self.then(null, function (err) {
      setTimeout(function () {
        throw err
      }, 0)
    })
  }
}
