import { Text } from '@keystonejs/fields';
import {
  LocationGoogleImplementation,
  MongoLocationGoogleInterface,
  KnexLocationGoogleInterface,
  PrismaLocationGoogleInterface,
} from './Implementation';
import path from 'path';

const pkgDir = path.dirname(require.resolve('@keystonejs/fields-location-google/package.json'));

export const LocationGoogle = {
  type: 'LocationGoogle',
  implementation: LocationGoogleImplementation,
  views: {
    Controller: path.join(pkgDir, 'views/Controller'),
    Field: path.join(pkgDir, 'views/Field'),
    Cell: path.join(pkgDir, 'views/Cell'),
    Filter: Text.views.Filter,
  },
  adapters: {
    mongoose: MongoLocationGoogleInterface,
    knex: KnexLocationGoogleInterface,
    prisma: PrismaLocationGoogleInterface,
  },
};
