const PassportTwitter = require('passport-twitter');
const PassportAuthStrategy = require('./Passport');

class TwitterAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(TwitterAuthStrategy.authType, keystone, listKey, {
      sessionIdField: 'twitterSession',
      keystoneSessionIdField: 'keystoneTwitterSessionId',
			scope: ['email'],
      ...config,
    });
  }

  validateWithService(strategy, token, { tokenSecret }) {
    return new Promise((resolve, reject) => {
      strategy.userProfile(token, tokenSecret, {}, async (error, profile) => {
        if (error) {
          return reject(error);
        }
        resolve({
          id: profile.id,
          username: profile.username || null,
        });
      });
    });
  }

  getPassportStrategy() {
    return new PassportTwitter(
      {
        consumerKey: this.config.consumerKey,
        consumerSecret: this.config.consumerSecret,
        callbackURL: this.config.callbackURL,
        passReqToCallback: true,
        includeEmail: true,
      },
      /**
       * from: https://github.com/jaredhanson/passport-oauth1/blob/master/lib/strategy.js#L24-L37
       * ---
       * Applications must supply a `verify` callback, for which the function
       * signature is:
       *
       *     function(token, tokenSecret, oauthParams, profile, done) { ... }
       *
       * The verify callback is responsible for finding or creating the user, and
       * invoking `done` with the following arguments:
       *
       *     done(err, user, info);
       *
       * `user` should be set to `false` to indicate an authentication failure.
       * Additional `info` can optionally be passed as a third argument, typically
       * used to display informational messages.  If an exception occured, `err`
       * should be set.
       */
      async (req, token, tokenSecret, oauthParams, profile, done) => {
        try {
          let result = await this.keystone.auth.User.twitter.validate({
            accessToken: token,
            tokenSecret,
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
}

TwitterAuthStrategy.authType = 'twitter';

module.exports = TwitterAuthStrategy;
