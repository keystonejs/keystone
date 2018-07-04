const path = require('path');

exports.port = process.env.PROJECTS_BASIC_PORT;
exports.appURL =
  process.env.PROJECTS_BASIC_APP_URL || `http://localhost:${exports.port}`;

exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk

exports.cloudinary = {
  cloudName: process.env.PROJECTS_BASIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.PROJECTS_BASIC_CLOUDINARY_KEY,
  apiSecret: process.env.PROJECTS_BASIC_CLOUDINARY_SECRET,
};
