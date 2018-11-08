const { File, MongoFileInterface } = require('./Implementation');

module.exports = {
  type: 'File',
  implementation: File,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoFileInterface,
  },
};
