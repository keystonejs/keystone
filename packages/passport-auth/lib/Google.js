const PassportGoogle = require('passport-google-oauth20');
const PassportAuthStrategy = require('./Passport');

class GoogleAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(
      GoogleAuthStrategy.authType,
      keystone,
      listKey,
      {
        scope: ['openid profile', 'openid email'],
        ...config,
      },
      PassportGoogle
    );
  }
}

GoogleAuthStrategy.authType = 'google';

module.exports = GoogleAuthStrategy;
