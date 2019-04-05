const GoogleAuthStrategy = require('@keystone-alpha/keystone/auth/Google');
const { appURL, googleAppKey, googleAppSecret } = require('./config');
const setupAuthRoutes = require('./setupAuthRoutes');

exports.configureGoogleAuth = function(keystone, server) {
  const strategy = keystone.createAuthStrategy({
    type: GoogleAuthStrategy,
    list: 'User',
    config: {
      clientID: googleAppKey,
      clientSecret: googleAppSecret,
      callbackURL: `${appURL}/auth/google/callback`,
      idField: 'googleId', // default value
      usernameField: 'googleUsername', // default value
      server,
    },
  });
  setupAuthRoutes({ strategy });
};
