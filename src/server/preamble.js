import _ from 'lodash';

Object.keys(__ENV_VARS__).forEach(x => {
    if (typeof process.env[x] === 'undefined') {
        process.env[x] = __ENV_VARS__[x];
    }
});

// must be required after process.env is set
require('debug').enable(process.env.DEBUG);
const reportDebug = require('debug')('deepiks:preamble');

reportDebug('process.env: ', _.pick(process.env, _.keys(__ENV_VARS__)));

if (process.env.NODE_ENV === 'development') {
    reportDebug('registering source-map-support');
    require('source-map-support').install();
}

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
