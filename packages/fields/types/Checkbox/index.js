const { Checkbox, MongoCheckboxInterface, KnexCheckboxInterface } = require('./Implementation');

module.exports = {
  type: 'Checkbox',
  implementation: Checkbox,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoCheckboxInterface,
    knex: KnexCheckboxInterface,
  },
};
