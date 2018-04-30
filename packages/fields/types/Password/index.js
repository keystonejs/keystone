const path = require('path');
const Password = require('./Password');

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  },
};
