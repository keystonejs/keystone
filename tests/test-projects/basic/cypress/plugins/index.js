// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

module.exports = (on, config) => {
  // Make env vars available to cypress tests via `Cypress.env()`
  config.env = process.env;

  config.baseUrl = `http://localhost:${process.env.PORT}`;

  return config;
};
