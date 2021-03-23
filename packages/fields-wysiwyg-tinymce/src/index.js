import { dirname } from 'path';
import express from 'express';
import { Text } from '@keystone-next/fields-legacy';
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
  adapters: Text.adapters,
  prepareMiddleware,
};
