import { importView } from '@keystonejs/build-field-types';

import {
  OEmbed as Implementation,
  MongoOEmbedInterface,
  KnexOEmbedInterface,
} from './Implementation';
import { OEmbedBlock } from './OEmbedBlock';
export { IframelyOEmbedAdapter } from './iframely/iframely';

export const OEmbed = {
  type: 'OEmbed',
  implementation: Implementation,
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
