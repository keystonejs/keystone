const falsey = require('falsey');
const pino = require('pino');
const memoize = require('fast-memoize');

module.exports = memoize(function(name) {
  return pino({
    name,
    enabled: falsey(process.env.DISABLE_LOGGING),
  });
});
