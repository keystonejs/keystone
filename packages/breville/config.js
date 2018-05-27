exports.port = process.env.PORT || 3000;
exports.appURL = process.env.APP_URL || `http://localhost:${exports.port}`;
exports.twitterAppKey = process.env.TWITTER_APP_KEY;
exports.twitterAppSecret = process.env.TWITTER_APP_SECRET;
exports.twitterAuthEnabled = exports.twitterAppKey && exports.twitterAppSecret;

exports.cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
};
