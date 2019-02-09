const { Content, MongoContentInterface } = require('./Implementation');

module.exports = {
  type: 'Content',
  implementation: Content,
  views: {
    Controller: require.resolve('../Text/Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoContentInterface,
  },
  blocks: {
    blockquote: require.resolve('./views/editor/blocks/blockquote'),
    embed: require.resolve('./views/editor/blocks/embed'),
    heading: require.resolve('./views/editor/blocks/heading'),
    image: require.resolve('./views/editor/blocks/image-container'),
    link: require.resolve('./views/editor/blocks/link'),
    orderedList: require.resolve('./views/editor/blocks/ordered-list'),
    unorderedList: require.resolve('./views/editor/blocks/unordered-list'),
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
