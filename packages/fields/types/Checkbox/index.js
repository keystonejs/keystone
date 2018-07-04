const path = require('path');
const { Checkbox, MongoCheckboxInterface } = require('./Implementation');

module.exports = {
  type: 'Checkbox',
  implementation: Checkbox,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoCheckboxInterface,
  },
};
