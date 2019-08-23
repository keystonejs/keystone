const PassportAuthStrategy = require('./lib/Passport');
const TwitterAuthStrategy = require('./lib/Twitter');
const FacebookAuthStrategy = require('./lib/Facebook');
const GoogleAuthStrategy = require('./lib/Google');
const GitHubAuthStrategy = require('./lib/GitHub');

module.exports = {
  PassportAuthStrategy,
  TwitterAuthStrategy,
  FacebookAuthStrategy,
  GoogleAuthStrategy,
  GitHubAuthStrategy,
};
