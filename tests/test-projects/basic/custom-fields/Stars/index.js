const { Integer } = require('@keystone-next/fields-legacy');
const {
  Stars,
  MongoIntegerInterface,
  KnexIntegerInterface,
  PrismaIntegerInterface,
} = require('./Implementation');

module.exports = {
  type: 'Stars',
  implementation: Stars,
  views: {
    Controller: Integer.views.Controller,
    Field: require.resolve('./views/Field'),
    Filter: Integer.views.Filter,
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
    prisma: PrismaIntegerInterface,
  },
};
