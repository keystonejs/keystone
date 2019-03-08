const {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
} = require('./Implementation');
const { CloudinaryBlock } = require('./Block');

module.exports = {
  type: 'CloudinaryImage',
  implementation: CloudinaryImage,
  views: {
    Controller: '@keystone-alpha/fields/types/CloudinaryImage/views/Controller',
    Field: '@keystone-alpha/fields/types/CloudinaryImage/views/Field',
    Cell: '@keystone-alpha/fields/types/CloudinaryImage/views/Cell',
  },
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
    knex: KnexCloudinaryImageInterface,
  },
  block: CloudinaryBlock,
};
