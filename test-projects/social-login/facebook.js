const FacebookAuthStrategy = require('@keystone-alpha/keystone/auth/Facebook');
const { appURL, facebookAppKey, facebookAppSecret } = require('./config');
const setupAuthRoutes = require('./setupAuthRoutes');

exports.configureFacebookAuth = function(keystone, server) {
  const strategy = keystone.createAuthStrategy({
    type: FacebookAuthStrategy,
    list: 'User',
    config: {
      clientID: facebookAppKey,
      clientSecret: facebookAppSecret,
      callbackURL: `${appURL}/auth/facebook/callback`,
      idField: 'facebookId',
      usernameField: 'facebookUsername',
      authSuccessRedirect: '/api/session', // defaults to '/'
      server,
    },
  });
  setupAuthRoutes(strategy);
};
