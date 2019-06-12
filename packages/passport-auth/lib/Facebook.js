const PassportFacebook = require('passport-facebook');
const PassportAuthStrategy = require('./Passport');

class FacebookAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(
      FacebookAuthStrategy.authType,
      keystone,
      listKey,
      {
        sessionIdField: 'facebookSession',
        keystoneSessionIdField: 'keystoneFacebookSessionId',
        scope: ['email'],
        // Make sure to include the 'profileFields' field when setting up your strategy.
        // https://stackoverflow.com/questions/22880876/passport-facebook-authentication-is-not-providing-email-for-all-facebook-account/32370813#32370813
        strategyConfig: {
          profileFields: ['id', 'emails', 'name'],
        },
        ...config,
      },
      PassportFacebook
    );
  }
}

FacebookAuthStrategy.authType = 'facebook';

module.exports = FacebookAuthStrategy;
