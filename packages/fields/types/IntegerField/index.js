const { Integer, MongoIntegerInterface, KnexIntegerInterface } = require('./Implementation');

module.exports = {
  type: 'Integer',
  implementation: Integer,
  // Peer Dependency
  views: '@voussoir/admin-view-integer',
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
  },
};
