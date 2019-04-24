const { GitHubAuthStrategy } = require('@keystone-alpha/passport-auth');
const { appURL, githubAppKey, githubAppSecret } = require('../config');

exports.configureGitHubAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: GitHubAuthStrategy,
    list: 'User',
    config: {
      consumerKey: githubAppKey,
      consumerSecret: githubAppSecret,
      callbackURL: `${appURL}/auth/github/callback`,
      idField: 'githubId', // default value
      usernameField: 'githubUsername', // default value
    },
  });
};
