const { Checkbox, MongoCheckboxInterface, KnexCheckboxInterface } = require('./Implementation');

module.exports = {
  type: 'Checkbox',
  implementation: Checkbox,
  // Peer Dependency
  views: '@voussoir/admin-view-checkbox',
  adapters: {
    mongoose: MongoCheckboxInterface,
    knex: KnexCheckboxInterface,
  },
};
