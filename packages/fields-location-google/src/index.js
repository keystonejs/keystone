import path from 'path';
import { Text } from '@keystone-next/fields-legacy';
import {
  LocationGoogleImplementation,
  MongoLocationGoogleInterface,
  KnexLocationGoogleInterface,
  PrismaLocationGoogleInterface,
} from './Implementation';

const pkgDir = path.dirname(
  require.resolve('@keystone-next/fields-location-google-legacy/package.json')
);

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
