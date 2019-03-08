const { Checkbox, MongoCheckboxInterface, KnexCheckboxInterface } = require('./Implementation');

module.exports = {
  type: 'Checkbox',
  implementation: Checkbox,
  views: {
    Controller: '@keystone-alpha/fields/types/Checkbox/views/Controller',
    Field: '@keystone-alpha/fields/types/Checkbox/views/Field',
    Filter: '@keystone-alpha/fields/types/Checkbox/views/Filter',
    Cell: '@keystone-alpha/fields/types/Checkbox/views/Cell',
  },
  adapters: {
    mongoose: MongoCheckboxInterface,
    knex: KnexCheckboxInterface,
  },
};
