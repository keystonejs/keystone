const { CloudinaryImage, MongoCloudinaryImageInterface } = require('./Implementation');

module.exports = {
  type: 'CloudinaryImage',
  implementation: CloudinaryImage,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
  },
};
