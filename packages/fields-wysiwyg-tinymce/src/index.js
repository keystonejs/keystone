import { Text } from '@keystone-alpha/fields';
import { importView } from '@keystone-alpha/build-field-types';

function bindStaticMiddleware(server) {
  const tinymce = require.resolve('tinymce');
  const tinymcePath = tinymce.substr(0, tinymce.lastIndexOf('/'));
  server.app.use('/tinymce-assets', server.express.static(tinymcePath));
}

export let Wysiwyg = {
  type: 'Wysiwyg',
  implementation: Text.implementation,
  views: {
    Controller: Text.views.Controller,
    Field: importView('./views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
  bindStaticMiddleware,
};
