const { Text } = require('@keystone-alpha/fields');
const path = require('path');

module.exports = {
  type: 'Wysiwyg',
  implementation: Text.implementation,
  views: {
    Controller: '@keystone-alpha/fields/types/Text/views/Controller',
    Field: path.join(__dirname, './views/Field'),
    Filter: '@keystone-alpha/fields/types/Text/views/Filter',
  },
  adapters: Text.adapters,
};
