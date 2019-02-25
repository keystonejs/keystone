const { Stars, MongoStarsInterface, KnexStarsInterface } = require('./Implementation');

module.exports = {
  type: 'Stars',
  implementation: Stars,
  views: require.resolve('../StarsAdminView'),
  adapters: {
    mongoose: MongoStarsInterface,
    knex: KnexStarsInterface,
  },
};
