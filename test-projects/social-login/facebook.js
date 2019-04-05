const { FacebookAuthStrategy } = require('@keystone-alpha/keystone');
const { appURL, facebookAppKey, facebookAppSecret } = require('./config');
const setupAuthRoutes = require('./setupAuthRoutes');

exports.configureFacebookAuth = function(keystone, server) {
  const strategy = keystone.createAuthStrategy({
    type: FacebookAuthStrategy,
    list: 'User',
    config: {
      consumerKey: facebookAppKey,
      consumerSecret: facebookAppSecret,
      callbackURL: `${appURL}/auth/facebook/callback`,
      idField: 'facebookId',
      usernameField: 'facebookUsername',
      server,
    },
  });
  setupAuthRoutes({ strategy });
};
