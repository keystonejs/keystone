const {
  FacebookAuthStrategy,
  GitHubAuthStrategy,
  GoogleAuthStrategy,
  TwitterAuthStrategy,
} = require('@keystone-alpha/passport-auth');
const WordPressAuthStrategy = require('./WordPressAuthStrategy');
const {
  appURL,
  facebookAppKey,
  facebookAppSecret,
  githubAppKey,
  githubAppSecret,
  googleAppKey,
  googleAppSecret,
  twitterAppKey,
  twitterAppSecret,
  wpAppKey,
  wpAppSecret,
} = require('../config');

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

exports.configureGitHubAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: GitHubAuthStrategy,
    list: 'User',
    config: {
      consumerKey: githubAppKey,
      consumerSecret: githubAppSecret,
      callbackURL: `${appURL}/auth/github/callback`,
      idField: 'githubId', // default value
      usernameField: 'githubUsername', // default value
    },
  });
};

exports.configureGoogleAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: GoogleAuthStrategy,
    list: 'User',
    config: {
      consumerKey: googleAppKey,
      consumerSecret: googleAppSecret,
      callbackURL: `${appURL}/auth/google/callback`,
      idField: 'googleId', // default value
      usernameField: 'googleUsername', // default value
    },
  });
};

exports.configureTwitterAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: TwitterAuthStrategy,
    list: 'User',
    config: {
      consumerKey: twitterAppKey,
      consumerSecret: twitterAppSecret,
      callbackURL: `${appURL}/auth/twitter/callback`,
      idField: 'twitterId', //default value
      usernameField: 'twitterUsername', //default value
    },
  });
};

exports.configureWPAuth = function(keystone) {
  return keystone.createAuthStrategy({
    type: WordPressAuthStrategy,
    list: 'User',
    config: {
      consumerKey: wpAppKey,
      consumerSecret: wpAppSecret,
      callbackURL: `${appURL}/auth/wordpress/callback`,
      idField: 'wordpressId', //default value
      usernameField: 'wordpressUsername', //default value
    },
  });
};
