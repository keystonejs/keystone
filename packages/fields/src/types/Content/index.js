import { Content, MongoContentInterface, KnexContentInterface } from './Implementation';
import path from 'path';

module.exports = {
  type: 'Content',
  implementation: Content,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, '../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoContentInterface,
    knex: KnexContentInterface,
  },
  blocks: {
    blockquote: { viewPath: path.join(__dirname, './views/blocks/blockquote') },
    embed: { viewPath: path.join(__dirname, './views/blocks/embed') },
    heading: { viewPath: path.join(__dirname, './views/blocks/heading') },
    image: { viewPath: path.join(__dirname, './views/blocks/image-container') },
    link: { viewPath: path.join(__dirname, './views/blocks/link') },
    orderedList: { viewPath: path.join(__dirname, './views/blocks/ordered-list') },
    unorderedList: { viewPath: path.join(__dirname, './views/blocks/unordered-list') },
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
