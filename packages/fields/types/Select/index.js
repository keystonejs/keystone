const Select = require('./Select');

module.exports = {
  type: 'Select',
  implementation: Select,
  basePath: __dirname,
  views: {
    Field: './views/Field',
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  }
};
