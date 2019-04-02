const FacebookAuthStrategy = require('@keystone-alpha/keystone/auth/Facebook');

const { appURL, facebookAppKey, facebookAppSecret } = require('./config');

exports.configureFacebookAuth = function(keystone, server) {
  keystone.createAuthStrategy({
    type: FacebookAuthStrategy,
    list: 'User',
    config: {
      clientID: facebookAppKey,
      clientSecret: facebookAppSecret,
      callbackURL: `${appURL}/auth/facebook/callback`,
      idField: 'facebookId',
      usernameField: 'facebookUsername',
      authSuccessRedirect: '/api/session',
      server,
    },
  });
};
