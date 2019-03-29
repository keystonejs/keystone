const { Text } = require('@keystone-alpha/fields');
const path = require('path');

const staticPath = '/tinymce-assets';
const tinymce = require.resolve('tinymce');
const tinymcePath = tinymce.substr(0, tinymce.lastIndexOf('/'));

function bindStaticMiddleware(server) {
  server.app.use(staticPath, server.express.static(tinymcePath));
}

module.exports = {
  type: 'Wysiwyg',
  implementation: Text.implementation,
  views: {
    Controller: '@keystone-alpha/fields/types/Text/views/Controller',
    Field: path.join(__dirname, './views/Field/Field'),
    Filter: '@keystone-alpha/fields/types/Text/views/Filter',
  },
  adapters: Text.adapters,
  bindStaticMiddleware,
  staticPath,
  tinymcePath,
};
