const { Relationship, MongoSelectInterface } = require('./Implementation');
const { resolveBacklinks } = require('./nested-mutations');

module.exports = {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
  },
  resolveBacklinks,
};
