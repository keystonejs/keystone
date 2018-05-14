const path = require('path');
const Implementation = require('./Implementation');

module.exports = {
  type: 'Text',
  implementation: Implementation,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  },
};
