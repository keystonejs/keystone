const { GitHubAuthStrategy } = require('@keystone-alpha/passport-auth');
const { appURL, githubAppKey, githubAppSecret } = require('./config');
const setupAuthRoutes = require('./setupAuthRoutes');

exports.configureGitHubAuth = function(keystone, server) {
  const strategy = keystone.createAuthStrategy({
    type: GitHubAuthStrategy,
    list: 'User',
    config: {
      consumerKey: githubAppKey,
      consumerSecret: githubAppSecret,
      callbackURL: `${appURL}/auth/github/callback`,
      idField: 'githubId', // default value
      usernameField: 'githubUsername', // default value
      server,
    },
  });
  setupAuthRoutes({ strategy });
};
