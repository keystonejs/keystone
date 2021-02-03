import { resolveView } from './resolve-view';

import {
  OEmbed as Implementation,
  MongoOEmbedInterface,
  KnexOEmbedInterface,
  PrismaOEmbedInterface,
} from './Implementation';
import { OEmbedBlock } from './OEmbedBlock';
export { IframelyOEmbedAdapter } from './iframely/iframely';

export const OEmbed = {
  type: 'OEmbed',
  implementation: Implementation,
  views: {
    Controller: resolveView('views/Controller'),
    Field: resolveView('views/Field'),
    Cell: resolveView('views/Cell'),
  },
  adapters: {
    mongoose: MongoOEmbedInterface,
    knex: KnexOEmbedInterface,
    prisma: PrismaOEmbedInterface,
  },
  blocks: {
    oEmbed: OEmbedBlock,
  },
};
