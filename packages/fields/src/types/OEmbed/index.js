import { importView } from '@keystone-alpha/build-field-types';

import {
  OEmbed,
  MongoOEmbedInterface,
  KnexOEmbedInterface,
} from './Implementation';

export default {
  type: 'OEmbed',
  implementation: OEmbed,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoOEmbedInterface,
    knex: KnexOEmbedInterface,
  },
};
