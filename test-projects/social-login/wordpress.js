const WordPressAuthStrategy = require('./WordPressAuthStrategy');
const { appURL, wpAppKey, wpAppSecret } = require('./config');
const setupAuthRoutes = require('./setupAuthRoutes');

exports.configureWPAuth = function(keystone, server) {
  const strategy = keystone.createAuthStrategy({
    type: WordPressAuthStrategy,
    list: 'User',
    config: {
      consumerKey: wpAppKey,
      consumerSecret: wpAppSecret,
      callbackURL: `${appURL}/auth/wordpress/callback`,
      idField: 'wordpressId', //default value
      usernameField: 'wordpressUsername', //default value
      server,
    },
  });
  setupAuthRoutes({ strategy });
};
