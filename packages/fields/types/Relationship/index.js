const {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
} = require('./Implementation');
const { resolveBacklinks } = require('./backlinks');
const path = require('path');

module.exports = {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  views: {
    Controller: path.join(__dirname, './Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoRelationshipInterface,
    knex: KnexRelationshipInterface,
  },
  resolveBacklinks,
};
