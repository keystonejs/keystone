import { dirname } from 'path';
import express from 'express';
import { Text } from '@keystonejs/fields';
import { importView } from '@keystonejs/build-field-types';
import { WysiwygImplementation } from './Implementation';

function prepareMiddleware() {
  const tinymcePath = dirname(require.resolve('tinymce'));
  const app = express();
  app.use('/tinymce-assets', express.static(tinymcePath));
  return app;
}

export let Wysiwyg = {
  type: 'Wysiwyg',
  implementation: WysiwygImplementation,
  views: {
    Controller: Text.views.Controller,
    Field: importView('./views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
  prepareMiddleware,
};
