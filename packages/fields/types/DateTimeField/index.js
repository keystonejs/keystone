const { DateTime, MongoDateTimeInterface, KnexDateTimeInterface } = require('./Implementation');

module.exports = {
  type: 'DateTime',
  implementation: DateTime,
  // Peer Dependency
  views: '@voussoir/admin-view-date-time',
  adapters: {
    mongoose: MongoDateTimeInterface,
    knex: KnexDateTimeInterface,
  },
};
