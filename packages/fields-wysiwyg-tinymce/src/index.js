import express from 'express';
import { Text } from '@keystone-alpha/fields';
import { importView } from '@keystone-alpha/build-field-types';

function prepareMiddleware() {
  const tinymce = require.resolve('tinymce');
  const tinymcePath = tinymce.substr(0, tinymce.lastIndexOf('/'));
  const app = express();
  app.use('/tinymce-assets', express.static(tinymcePath));
  return app;
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
  prepareMiddleware,
};
