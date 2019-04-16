import { Content, MongoContentInterface, KnexContentInterface } from './Implementation';
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
    blockquote: { viewPath: importView('./views/blocks/blockquote') },
    embed: { viewPath: importView('./views/blocks/embed') },
    heading: { viewPath: importView('./views/blocks/heading') },
    image: { viewPath: importView('./views/blocks/image-container') },
    link: { viewPath: importView('./views/blocks/link') },
    orderedList: { viewPath: importView('./views/blocks/ordered-list') },
    unorderedList: { viewPath: importView('./views/blocks/unordered-list') },
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
