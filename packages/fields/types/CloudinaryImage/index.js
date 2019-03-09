const {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
} = require('./Implementation');
const { CloudinaryBlock } = require('./Block');
const path = require('path');

module.exports = {
  type: 'CloudinaryImage',
  implementation: CloudinaryImage,
  views: {
    Controller: path.join(__dirname, './Controller'),
    Field: path.join(__dirname, './views/Field'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
    knex: KnexCloudinaryImageInterface,
  },
  block: CloudinaryBlock,
};
