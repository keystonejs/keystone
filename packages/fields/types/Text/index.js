const { Text, MongoTextInterface, KnexTextInterface } = require('./Implementation');

module.exports = {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: '@keystone-alpha/fields/types/Text/views/Controller',
    Field: '@keystone-alpha/fields/types/Text/views/Field',
    Filter: '@keystone-alpha/fields/types/Text/views/Filter',
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
  },
};
