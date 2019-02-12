const { Content, MongoContentInterface, KnexContentInterface } = require('./Implementation');

module.exports = {
  type: 'Content',
  implementation: Content,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoContentInterface,
    knex: KnexContentInterface,
  },
  blocks: {
    blockquote: { viewPath: require.resolve('./views/editor/blocks/blockquote') },
    embed: { viewPath: require.resolve('./views/editor/blocks/embed') },
    heading: { viewPath: require.resolve('./views/editor/blocks/heading') },
    image: { viewPath: require.resolve('./views/editor/blocks/image-container') },
    link: { viewPath: require.resolve('./views/editor/blocks/link') },
    orderedList: { viewPath: require.resolve('./views/editor/blocks/ordered-list') },
    unorderedList: { viewPath: require.resolve('./views/editor/blocks/unordered-list') },
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
