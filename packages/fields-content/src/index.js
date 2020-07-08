import { Text } from '@keystonejs/fields';
import {
  Content as ContentType,
  MongoContentInterface,
  KnexContentInterface,
  PrismaContentInterface,
} from './Implementation';
import {
  blockquote,
  heading,
  imageContainer as image,
  link,
  orderedList,
  unorderedList,
} from './blocks';
import { resolveView } from './resolve-view';

export const Content = {
  type: 'Content',
  implementation: ContentType,
  views: {
    Controller: resolveView('views/Controller'),
    Field: resolveView('views/Field'),
    Cell: resolveView('views/Cell'),
    Filter: Text.views.Filter,
  },
  adapters: {
    mongoose: MongoContentInterface,
    knex: KnexContentInterface,
    prisma: PrismaContentInterface,
  },
  blocks: {
    blockquote,
    heading,
    image,
    link,
    orderedList,
    unorderedList,
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
