const path = require('path');
const Implementation = require('./Implementation');

module.exports = {
  type: 'CloudinaryImage',
  implementation: Implementation,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  },
};
