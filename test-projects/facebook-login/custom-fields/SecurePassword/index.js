const path = require('path');
const DefaultPasswordField = require('@keystone-alpha/fields').Password;

module.exports = Object.assign({}, DefaultPasswordField, {
  type: 'Password',
  views: {
    Field: path.resolve(__dirname, './views/Field'),
  },
});
