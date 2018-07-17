const path = require('path');
const DefaultPasswordField = require('@keystonejs/fields').Password;

module.exports = Object.assign({}, DefaultPasswordField, {
  type: 'Password',
  views: {
    Field: path.resolve(__dirname, './views/Field'),
  },
});
