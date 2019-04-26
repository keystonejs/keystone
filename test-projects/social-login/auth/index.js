const { InitializePassportAuthStrategies } = require('@keystone-alpha/passport-auth');
const {
  configureFacebookAuth,
  configureGitHubAuth,
  configureGoogleAuth,
  configureTwitterAuth,
  configureWPAuth,
} = require('./strategies');
const setupAuthRoutes = require('./setupAuthRoutes');

module.exports = {
  configureFacebookAuth,
  configureGitHubAuth,
  configureTwitterAuth,
  configureGoogleAuth,
  configureWPAuth,
  InitializePassportAuthStrategies,
  setupAuthRoutes,
};
