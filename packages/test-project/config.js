exports.port = process.env.PORT || 3000;
exports.twitterAppKey = process.env.TWITTER_APP_KEY;
exports.twitterAppSecret = process.env.TWITTER_APP_SECRET;
exports.enableTwitterAuth = exports.twitterAppKey && exports.twitterAppSecret;
