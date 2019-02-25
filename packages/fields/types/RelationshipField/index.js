const {
  Relationship,
  MongoRelationshipInterface,
  KnexRelationshipInterface,
} = require('./Implementation');
const { resolveBacklinks } = require('./backlinks');

module.exports = {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  // Peer Dependency
  views: '@voussoir/admin-view-relationship',
  adapters: {
    mongoose: MongoRelationshipInterface,
    knex: KnexRelationshipInterface,
  },
  resolveBacklinks,
};
