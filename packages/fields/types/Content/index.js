const { Content, MongoContentInterface, KnexContentInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'Content',
  implementation: Content,
  views: {
    Controller: path.join(__dirname, './Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, '../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoContentInterface,
    knex: KnexContentInterface,
  },
  blocks: {
    blockquote: { viewPath: path.join(__dirname, './views/editor/blocks/blockquote') },
    embed: { viewPath: path.join(__dirname, './views/editor/blocks/embed') },
    heading: { viewPath: path.join(__dirname, './views/editor/blocks/heading') },
    image: { viewPath: path.join(__dirname, './views/editor/blocks/image-container') },
    link: { viewPath: path.join(__dirname, './views/editor/blocks/link') },
    orderedList: { viewPath: path.join(__dirname, './views/editor/blocks/ordered-list') },
    unorderedList: { viewPath: path.join(__dirname, './views/editor/blocks/unordered-list') },
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
