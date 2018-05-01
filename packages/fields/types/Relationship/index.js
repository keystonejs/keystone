const path = require('path');
const Relationship = require('./Relationship');

module.exports = {
  type: 'Relationship',
  implementation: Relationship,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  },
};
