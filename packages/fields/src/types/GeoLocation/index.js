import { GeoLocation, MongoGeoLocationInterface, KnexGeoLocationInterface } from './Implementation';
import { importView } from '@keystone-alpha/build-field-types';

export default {
  type: 'GeoLocation',
  implementation: GeoLocation,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoGeoLocationInterface,
    knex: KnexGeoLocationInterface,
  },
};
