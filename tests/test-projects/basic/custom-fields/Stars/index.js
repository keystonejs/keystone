const {
  Stars,
  MongoIntegerInterface,
  KnexIntegerInterface,
  PrismaIntegerInterface,
} = require('./Implementation');

const { Integer } = require('@keystonejs/fields');

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
