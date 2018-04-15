const Text = require('./Text');

module.exports = {
  type: 'Text',
  implementation: Text,
  basePath: __dirname,
  views: {
    Field: './views/Field',
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  }
};
