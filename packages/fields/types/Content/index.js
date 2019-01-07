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
        ...this.config.blocks.reduce((obj, val, i) => {
          obj['$$block$$' + i] = Array.isArray(val) ? val[0] : val;
          return obj;
        }, {}),
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
  blockquote: require.resolve('./views/editor/block-types/blockquote'),
  embed: require.resolve('./views/editor/block-types/embed'),
  heading: require.resolve('./views/editor/block-types/heading'),
  image: require.resolve('./views/editor/block-types/image'),
  link: require.resolve('./views/editor/block-types/link'),
  orderedList: require.resolve('./views/editor/block-types/ordered-list'),
  unorderedList: require.resolve('./views/editor/block-types/unordered-list'),
  // not exposing list-item since it's only used internally by the other blocks
  // listItem: require.resolve('./views/editor/block-types/list-item'),
  // not exposing paragraph since it's included by default
  // paragraph: require.resolve('./views/editor/block-types/paragraph'),
};
