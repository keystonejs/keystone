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
  views: {
    Controller: '@keystone-alpha/fields/types/Relationship/views/Controller',
    Field: '@keystone-alpha/fields/types/Relationship/views/Field',
    Filter: '@keystone-alpha/fields/types/Relationship/views/Filter',
    Cell: '@keystone-alpha/fields/types/Relationship/views/Cell',
  },
  adapters: {
    mongoose: MongoRelationshipInterface,
    knex: KnexRelationshipInterface,
  },
  resolveBacklinks,
};
