const Keystone = require('./lib/Keystone');
const PasswordAuthStrategy = require('./lib/auth/Password');
const PassportAuthStrategy = require('./lib/auth/Passport');
const TwitterAuthStrategy = require('./lib/auth/Twitter');
const FacebookAuthStrategy = require('./lib/auth/Facebook');
const GoogleAuthStrategy = require('./lib/auth/Google');
const GitHubAuthStrategy = require('./lib/auth/GitHub');
const { BaseKeystoneAdapter, BaseListAdapter, BaseFieldAdapter } = require('./lib/adapters');

module.exports = {
  Keystone,
  PasswordAuthStrategy,
  PassportAuthStrategy,
  TwitterAuthStrategy,
  FacebookAuthStrategy,
  GoogleAuthStrategy,
  GitHubAuthStrategy,
  BaseKeystoneAdapter,
  BaseListAdapter,
  BaseFieldAdapter,
};
