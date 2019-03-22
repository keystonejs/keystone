const { Checkbox, MongoCheckboxInterface, KnexCheckboxInterface } = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'Checkbox',
  implementation: Checkbox,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoCheckboxInterface,
    knex: KnexCheckboxInterface,
  },
};
