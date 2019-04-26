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
        ...config,
      },
      PassportFacebook
    );
  }
}

FacebookAuthStrategy.authType = 'facebook';

module.exports = FacebookAuthStrategy;
