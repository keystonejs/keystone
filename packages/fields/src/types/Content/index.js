import { Content, MongoContentInterface, KnexContentInterface } from './Implementation';
import blockquote from './blocks/blockquote';
import embed from './blocks/embed';
import heading from './blocks/heading';
import image from './blocks/image-container';
import link from './blocks/link';
import orderedList from './blocks/ordered-list';
import unorderedList from './blocks/unordered-list';
import { importView } from '@keystone-alpha/build-field-types';

export default {
  type: 'Content',
  implementation: Content,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoContentInterface,
    knex: KnexContentInterface,
  },
  blocks: {
    blockquote,
    embed,
    heading,
    image,
    link,
    orderedList,
    unorderedList,
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
