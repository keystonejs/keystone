const { FacebookAuthStrategy } = require('@keystone-alpha/passport-auth');
const { appURL, facebookAppKey, facebookAppSecret } = require('../config');

exports.configureFacebookAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: FacebookAuthStrategy,
    list: 'User',
    config: {
      consumerKey: facebookAppKey,
      consumerSecret: facebookAppSecret,
      callbackURL: `${appURL}/auth/facebook/callback`,
      idField: 'facebookId',
      usernameField: 'facebookUsername',
    },
  });
};
