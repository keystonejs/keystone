const { TwitterAuthStrategy } = require('@keystone-alpha/passport-auth');
const { appURL, twitterAppKey, twitterAppSecret } = require('../config');

exports.configureTwitterAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      consumerKey: twitterAppKey,
      consumerSecret: twitterAppSecret,
      callbackURL: `${appURL}/auth/twitter/callback`,
      idField: 'twitterId', //default value
      usernameField: 'twitterUsername', //default value
    },
  });
};
