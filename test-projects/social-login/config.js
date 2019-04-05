const path = require('path');

exports.port = process.env.PORT || 3000;
exports.appURL = process.env.APP_URL || `http://localhost:${exports.port}`;

exports.facebookAppKey = process.env.FACEBOOK_APP_KEY;
exports.facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
exports.facebookAuthEnabled = exports.facebookAppKey && exports.facebookAppSecret;

exports.githubAppKey = process.env.GITHUB_APP_KEY;
exports.githubAppSecret = process.env.GITHUB_APP_SECRET;
exports.githubAuthEnabled = exports.githubAppKey && exports.githubAppSecret;

exports.twitterAppKey = process.env.TWITTER_APP_KEY;
exports.twitterAppSecret = process.env.TWITTER_APP_SECRET;
exports.twitterAuthEnabled = exports.twitterAppKey && exports.twitterAppSecret;

exports.googleAppKey = process.env.GOOGLE_APP_KEY;
exports.googleAppSecret = process.env.GOOGLE_APP_SECRET;
exports.googleAuthEnabled = exports.googleAppKey && exports.googleAppSecret;

exports.wpAppKey = process.env.WP_APP_KEY;
exports.wpAppSecret = process.env.WP_APP_SECRET;
exports.wpAuthEnabled = exports.wpAppKey && exports.wpAppSecret;

exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk

exports.cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
};
