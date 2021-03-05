import path from 'path';
import { Text } from '@keystone-next/fields-legacy';

const pkgDir = path.dirname(require.resolve('@keystone-next/fields-markdown-legacy/package.json'));

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
