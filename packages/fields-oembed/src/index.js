import {
  OEmbed as Implementation,
  MongoOEmbedInterface,
  KnexOEmbedInterface,
  PrismaOEmbedInterface,
} from './Implementation';
export { IframelyOEmbedAdapter } from './iframely/iframely';

export const OEmbed = {
  type: 'OEmbed',
  implementation: Implementation,
  adapters: {
    mongoose: MongoOEmbedInterface,
    knex: KnexOEmbedInterface,
    prisma: PrismaOEmbedInterface,
  },
};
