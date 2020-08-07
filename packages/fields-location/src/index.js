import { Text } from '@keystonejs/fields';
import { Location, MongoLocationInterface, KnexLocationInterface } from './Implementation';
import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystonejs/fields-location/package.json'));

export default {
  type: 'Location',
  implementation: Location,
  views: {
    Controller: path.join(pkgDir, 'views/Controller'),
    Field: path.join(pkgDir, 'views/Field'),
    Cell: path.join(pkgDir, 'views/Cell'),
    Filter: Text.views.Filter,
  },
  adapters: {
    mongoose: MongoLocationInterface,
    knex: KnexLocationInterface,
  },
};
