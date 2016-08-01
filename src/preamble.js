Object.keys(__dotEnvObj__).forEach(x => {
    if (typeof process.env[x] === 'undefined') {
        process.env[x] = __dotEnvObj__[x];
    }
});


// Promise.done is non-standard but some modules depend on it
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
