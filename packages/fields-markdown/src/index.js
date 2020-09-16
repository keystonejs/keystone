import path from 'path';
import { Text } from '@keystonejs/fields';

const pkgDir = path.dirname(require.resolve('@keystonejs/fields-markdown/package.json'));

export let Markdown = {
  type: 'Markdown',
  implementation: Text.implementation,
  views: {
    Controller: Text.views.Controller,
    Field: path.join(pkgDir, 'views/Field'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
