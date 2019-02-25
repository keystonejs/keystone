const { Content, MongoContentInterface, KnexContentInterface } = require('./Implementation');

module.exports = {
  type: 'Content',
  implementation: Content,
  // Peer Dependency
  views: '@voussoir/admin-view-content',
  adapters: {
    mongoose: MongoContentInterface,
    knex: KnexContentInterface,
  },
};
