const PassportTwitter = require('passport-twitter');
const PassportAuthStrategy = require('./Passport');

class TwitterAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(
      TwitterAuthStrategy.authType,
      keystone,
      listKey,
      {
        scope: ['email'],
        ...config,
        strategyConfig: {
          consumerKey: config.appId,
          consumerSecret: config.appSecret,
          includeEmail: true,
          // See: https://github.com/jaredhanson/passport-twitter/issues/67#issuecomment-275288663
          userProfileURL:
            'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
          ...config.strategyConfig,
        },
      },
      PassportTwitter
    );
  }

  async _validateWithService(strategy, accessToken, tokenSecret) {
    return new Promise((resolve, reject) => {
      strategy.userProfile(accessToken, tokenSecret, {}, async (error, serviceProfile) => {
        if (error) {
          return reject(error);
        }
        resolve(serviceProfile);
      });
    });
  }
}

TwitterAuthStrategy.authType = 'twitter';

module.exports = TwitterAuthStrategy;
