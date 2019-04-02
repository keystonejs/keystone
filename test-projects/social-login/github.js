const GitHubAuthStrategy = require('@keystone-alpha/keystone/auth/GitHub');

const { appURL, githubAppKey, githubAppSecret } = require('./config');

exports.configureGitHubAuth = function(keystone, server) {
  keystone.createAuthStrategy({
    type: GitHubAuthStrategy,
    list: 'User',
    config: {
      consumerKey: githubAppKey,
      consumerSecret: githubAppSecret,
      enableAuthRoutes: true, // default true
      authRoot: 'auth',
      callbackURL: `${appURL}/auth/github/callback`,
      authSuccessRedirect: '/api/session',
      idField: 'githubId', // default value
      usernameField: 'githubUsername', // default value
      server,
    },
  });
};
