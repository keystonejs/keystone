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
      enableAuthRoutes: true, // default true
      authRoot: 'auth',
      callbackURL: `${appURL}/auth/google/callback`,
      authSuccessRedirect: '/api/session', // defaults to '/'
      idField: 'googleId', // default value
      usernameField: 'googleUsername', // default value
      server,
    },
  });
  setupAuthRoutes(strategy);
};
