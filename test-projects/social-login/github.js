const GitHubAuthStrategy = require('@keystone-alpha/keystone/auth/GitHub');

const { appURL, githubAppKey, githubAppSecret } = require('./config');

exports.configureGitHubAuth = function(keystone, server) {
  keystone.createAuthStrategy({
    type: GitHubAuthStrategy,
    list: 'User',
    config: {
      clientID: githubAppKey,
      clientSecret: githubAppSecret,
      enableAuthRoutes: true, // default true
      authRoot: 'auth',
      callbackURL: `${appURL}/auth/github/callback`,
      authSuccessRedirect: '/api/session', // defaults to '/'
      idField: 'githubId', // default value
      usernameField: 'githubUsername', // default value
      server,
    },
  });
};
