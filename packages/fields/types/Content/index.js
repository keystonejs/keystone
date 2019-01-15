const { MongoTextInterface, Text } = require('../Text/Implementation');

module.exports = {
  type: 'Content',
  implementation: class Content extends Text {
    extendAdminMeta(meta) {
      return {
        ...meta,
        blockOptions: this.config.blocks.map(block => {
          if (Array.isArray(block)) {
            return block[1];
          }
          return undefined;
        }),
      };
    }
    extendViews(views) {
      return {
        ...views,
        blocks: this.config.blocks.map(block => (Array.isArray(block) ? block[0] : block)),
      };
    }
  },
  views: {
    Controller: require.resolve('../Text/Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('../Text/views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
  },
};

module.exports.blocks = {
  blockquote: require.resolve('./views/editor/blocks/blockquote'),
  embed: require.resolve('./views/editor/blocks/embed'),
  heading: require.resolve('./views/editor/blocks/heading'),
  image: require.resolve('./views/editor/blocks/image-container'),
  link: require.resolve('./views/editor/blocks/link'),
  orderedList: require.resolve('./views/editor/blocks/ordered-list'),
  unorderedList: require.resolve('./views/editor/blocks/unordered-list'),
  // not exposing list-item since it's only used internally by the other blocks
  // listItem: require.resolve('./views/editor/blocks/list-item'),
  // not exposing paragraph since it's included by default
  // paragraph: require.resolve('./views/editor/blocks/paragraph'),
};
