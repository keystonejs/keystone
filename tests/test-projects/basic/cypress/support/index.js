// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Cypress doesn’t recognize `window.fetch` calls as XHR requests, which makes
// it impossible to stub them. We delete `fetch` from the window object so the
// polyfill (which uses proper `XMLHttpRequest`) kicks in.
// "lolwat?" Yeah, me too. Check out: https://github.com/cypress-io/cypress/issues/687#issuecomment-384953881
Cypress.on('window:before:load', function (win) {
  win.fetch = require('cross-fetch');
});
