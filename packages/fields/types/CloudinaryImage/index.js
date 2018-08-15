const path = require('path');
const { CloudinaryImage, MongoCloudinaryImageInterface } = require('./Implementation');

module.exports = {
  type: 'CloudinaryImage',
  implementation: CloudinaryImage,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
  },
};
