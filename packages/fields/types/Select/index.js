const path = require('path');
const Select = require('./Select');

module.exports = {
  type: 'Select',
  implementation: Select,
  views: {
    Field: path.resolve(__dirname, './views/Field'),
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  }
};
