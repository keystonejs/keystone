const PassportFacebook = require('passport-facebook');
const PassportAuthStrategy = require('./Passport');

class FacebookAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(FacebookAuthStrategy.authType, keystone, listKey, {
      sessionIdField: 'facebookSession',
      keystoneSessionIdField: 'keystoneFacebookSessionId',
      ...config,
    });
  }

  //#region implementing abstract methods
  getPassportStrategy() {
    return new PassportFacebook(
      {
        clientID: this.config.consumerKey,
        clientSecret: this.config.consumerSecret,
        callbackURL: this.config.callbackURL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let result = await this.keystone.auth.User.facebook.validate({
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

FacebookAuthStrategy.authType = 'facebook';

module.exports = FacebookAuthStrategy;
