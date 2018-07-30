const path = require('path');
const { Relationship, MongoSelectInterface } = require('./Implementation');

module.exports = {
  type: 'Relationship',
  isRelationship: true, // Used internally for this special case
  implementation: Relationship,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoSelectInterface,
  },
};
