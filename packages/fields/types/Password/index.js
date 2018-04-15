const Password = require('./Password');

module.exports = {
  type: 'Password',
  implementation: Password,
  basePath: __dirname,
  views: {
    Field: './views/Field',
  },
  adapters: {
    // TODO: Extract mongo specific logic out of implementation
    // mongoose: require('./adapters/mongoose'),
  }
};
