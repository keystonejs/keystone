import { importView } from '@keystonejs/build-field-types';

import { OEmbed, MongoOEmbedInterface, KnexOEmbedInterface } from './Implementation';
import { OEmbedBlock } from './OEmbedBlock';

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
  blocks: {
    oEmbed: OEmbedBlock,
  },
};
