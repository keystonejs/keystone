import { Text } from '@keystone-next/fields-legacy';
import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystone-next/fields-color-legacy/package.json'));

export const Color = {
  type: 'Color',
  implementation: Text.implementation,
  views: {
    Controller: Text.views.Controller,
    Field: path.join(pkgDir, 'views/Field'),
    Cell: path.join(pkgDir, 'views/Cell'),
    Filter: Text.views.Filter,
  },
  adapters: Text.adapters,
};
