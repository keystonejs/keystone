const path = require('path');
const DefaultPasswordField = require('@keystone-alpha/fields').Password;

module.exports = {
  ...DefaultPasswordField,
  type: 'Password',
  views: {
    Field: path.resolve(__dirname, './views/Field'),
  },
};
