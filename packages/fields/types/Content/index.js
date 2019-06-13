const path = require('path');

const { Content, MongoContentInterface, KnexContentInterface } = require('./Implementation');
const blockquote = require('./blocks/blockquote');
const heading = require('./blocks/heading');
const image = require('./blocks/image-container');
const link = require('./blocks/link');
const orderedList = require('./blocks/ordered-list');
const unorderedList = require('./blocks/unordered-list');

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
