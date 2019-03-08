const { Content, MongoContentInterface, KnexContentInterface } = require('./Implementation');

module.exports = {
  type: 'Content',
  implementation: Content,
  views: {
    Controller: '@keystone-alpha/fields/types/Content/views/Controller',
    Field: '@keystone-alpha/fields/types/Content/views/Field',
    Filter: '@keystone-alpha/fields/types/Text/views/Filter',
  },
  adapters: {
    mongoose: MongoContentInterface,
    knex: KnexContentInterface,
  },
  blocks: {
    blockquote: { viewPath: '@keystone-alpha/fields/types/Content/views/blocks/blockquote' },
    embed: { viewPath: '@keystone-alpha/fields/types/Content/views/blocks/embed' },
    heading: { viewPath: '@keystone-alpha/fields/types/Content/views/blocks/heading' },
    image: { viewPath: '@keystone-alpha/fields/types/Content/views/blocks/image-container' },
    link: { viewPath: '@keystone-alpha/fields/types/Content/views/blocks/link' },
    orderedList: {
      viewPath: '@keystone-alpha/fields/types/Content/views/blocks/ordered-list',
    },
    unorderedList: {
      viewPath: '@keystone-alpha/fields/types/Content/views/blocks/unordered-list',
    },
    // not exposing list-item since it's only used internally by the other blocks
    // not exposing paragraph since it's included by default
  },
};
