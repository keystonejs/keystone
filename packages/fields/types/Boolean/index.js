const path = require('path');
const { Boolean, MongoBooleanInterface } = require('./Implementation');

module.exports = {
  type: 'Bool',
  implementation: Boolean,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoBooleanInterface,
  },
};
