exports.port = process.env.PORT || 3000;
exports.appURL = process.env.APP_URL || `http://localhost:${exports.port}`;

exports.facebookAppKey = process.env.FACEBOOK_APP_KEY;
exports.facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
exports.facebookAuthEnabled = exports.facebookAppKey && exports.facebookAppSecret;

exports.cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
};
