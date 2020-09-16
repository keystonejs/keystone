const falsey = require('falsey');
const pino = require('pino');

module.exports = {
  graphqlLogger: pino({ name: 'graphql', enabled: falsey(process.env.DISABLE_LOGGING) }),
};
