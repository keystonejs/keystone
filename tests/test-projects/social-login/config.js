const path = require('path');

exports.port = process.env.PORT || 3000;

exports.facebook = process.env.FACEBOOK_APP_ID &&
  process.env.FACEBOOK_APP_SECRET && {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  };

exports.google = process.env.GOOGLE_APP_ID &&
  process.env.GOOGLE_APP_SECRET && {
    appId: process.env.GOOGLE_APP_ID,
    appSecret: process.env.GOOGLE_APP_SECRET,
  };

exports.twitter = process.env.TWITTER_APP_ID &&
  process.env.TWITTER_APP_SECRET && {
    appId: process.env.TWITTER_APP_ID,
    appSecret: process.env.TWITTER_APP_SECRET,
  };

exports.github = process.env.GITHUB_APP_ID &&
  process.env.GITHUB_APP_SECRET && {
    appId: process.env.GITHUB_APP_ID,
    appSecret: process.env.GITHUB_APP_SECRET,
  };

exports.cookieSecret = 'qwerty';

exports.staticRoute = '/public'; // The URL portion
exports.staticPath = path.join(process.cwd(), 'public'); // The local path on disk

exports.cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
};
