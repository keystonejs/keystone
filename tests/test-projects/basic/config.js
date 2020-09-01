const path = require('path');

exports.port = process.env.PORT;

exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk

exports.cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
};

exports.iframely = {
  apiKey: process.env.IFRAMELY_API_KEY,
};

exports.unsplash = {
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  secretKey: process.env.UNSPLASH_SECRET_KEY,
};
