const PassportWordPress = require('passport-wordpress').Strategy;
const { PassportAuthStrategy } = require('@keystone-alpha/keystone');

class WordPressAuthStrategy extends PassportAuthStrategy {
  constructor(keystone, listKey, config) {
    super(
      WordPressAuthStrategy.authType,
      keystone,
      listKey,
      {
        sessionIdField: 'wordpressSession',
        keystoneSessionIdField: 'keystoneWordPressSessionId',
        ...config,
      },
      PassportWordPress
    );
  }
}

WordPressAuthStrategy.authType = 'wordpress';

module.exports = WordPressAuthStrategy;
