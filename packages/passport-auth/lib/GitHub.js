const PassportGitHub = require('passport-github');
const PassportAuthStrategy = require('./Passport');

class GitHubAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(GitHubAuthStrategy.authType, keystone, listKey, config, PassportGitHub);
  }
}

GitHubAuthStrategy.authType = 'github';

module.exports = GitHubAuthStrategy;
