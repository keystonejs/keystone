const { Text, MongoTextInterface, KnexTextInterface } = require('./Implementation');

module.exports = {
  type: 'Text',
  implementation: Text,
  // Peer Dependency
  views: '@voussoir/admin-view-text',
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
