const TwitterAuthStrategy = require('@keystone-alpha/keystone/auth/Twitter');
const { appURL, twitterAppKey, twitterAppSecret } = require('./config');
const setupAuthRoutes = require('./setupAuthRoutes');

exports.configureTwitterAuth = function(keystone, server) {
  const strategy = keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      consumerKey: twitterAppKey,
      consumerSecret: twitterAppSecret,
      callbackURL: `${appURL}/auth/twitter/callback`,
      idField: 'twitterId', //default value
      usernameField: 'twitterUsername', //default value
      authSuccessRedirect: '/api/session', // defaults to '/'
      server,
    },
  });
  setupAuthRoutes(strategy);
};
