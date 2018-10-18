const path = require('path');
const { Decimal, MongoDecimalInterface } = require('./Implementation');

module.exports = {
  type: 'Decimal',
  implementation: Decimal,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
  },
  adapters: {
    mongoose: MongoDecimalInterface,
  },
};
