const { InitializePassportAuthStrategies } = require('@keystone-alpha/passport-auth');
const { configureFacebookAuth } = require('./facebook');
const { configureGitHubAuth } = require('./github');
const { configureTwitterAuth } = require('./twitter');
const { configureGoogleAuth } = require('./google');
const { configureWPAuth } = require('./wordpress');
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
