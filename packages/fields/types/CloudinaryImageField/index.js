const {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
} = require('./Implementation');

module.exports = {
  type: 'CloudinaryImage',
  implementation: CloudinaryImage,
  // Peer Dependency
  views: '@voussoir/admin-view-cloudinary-image',
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
    knex: KnexCloudinaryImageInterface,
  },
};
