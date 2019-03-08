const { Text, MongoTextInterface, KnexTextInterface } = require('../Text/Implementation');

module.exports = {
  type: 'Url',
  implementation: Text,
  views: {
    Controller: '@keystone-alpha/fields/types/Text/views/Controller',
    Field: '@keystone-alpha/fields/types/Url/views/Field',
    Filter: '@keystone-alpha/fields/types/Text/views/Filter',
    Cell: '@keystone-alpha/fields/types/Url/views/Cell',
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
