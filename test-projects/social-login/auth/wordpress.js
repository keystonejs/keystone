const WordPressAuthStrategy = require('./WordPressAuthStrategy');
const { appURL, wpAppKey, wpAppSecret } = require('../config');

exports.configureWPAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: WordPressAuthStrategy,
    list: 'User',
    config: {
      consumerKey: wpAppKey,
      consumerSecret: wpAppSecret,
      callbackURL: `${appURL}/auth/wordpress/callback`,
      idField: 'wordpressId', //default value
      usernameField: 'wordpressUsername', //default value
    },
  });
};
