// const passport = require('passport');
const PassportGitHub = require('passport-github');
const PassportAuthStrategy = require('./Passport');

class GitHubAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(GitHubAuthStrategy.authType, keystone, listKey, {
      sessionIdField: 'githubSession',
      keystoneSessionIdField: 'keystoneGitHubSessionId',
      ...config,
    });
  }

  //#region implementing abstract methods
  getPassportStrategy() {
    return new PassportGitHub(
      {
        clientID: this.config.consumerKey,
        clientSecret: this.config.consumerSecret,
        callbackURL: this.config.callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let result = await this.keystone.auth.User.github.validate({
            accessToken,
          });
          if (!result.success) {
            // false indicates an authentication failure
            return done(null, false, { ...result, profile });
          }
          return done(null, result.item, { ...result, profile });
        } catch (error) {
          return done(error);
        }
      }
    );
  }
  //#endregion
}

GitHubAuthStrategy.authType = 'github';

module.exports = GitHubAuthStrategy;
