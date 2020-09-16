// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (identity, secret) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const gql = require('graphql-tag');

function graphqlOperation(type) {
  return function (uri, operationString) {
    // Convert the string to an ast
    const operation = gql(operationString);

    // Then pass it through to the window context for execution.
    // Why execute it from the window context? Because that's where the cookies,
    // etc, are.
    // Why not read the cookies, and execute it from within the test? Because
    // the cookies are HTTP-only, so they're not accessible via JavaScript.
    // NOTE: Timeout of 10s as sometimes this command was timing out after the
    // default 4s.
    return cy.window({ timeout: 10000 }).then({ timeout: 10000 }, win =>
      // NOTE: __APOLLO_CLIENT__ is only available in dev mode
      // (process.env.NODE_ENV !== 'production'), so this may error at some
      // point. If so, we need another way of attaching a global graphql query
      // lib to the window from within the app for testing.
      win.__APOLLO_CLIENT__[type]({
        [type === 'mutate' ? 'mutation' : type]: operation,
        // Avoid anything which may be cached when loading the admin UI - we
        // want to test how the GraphQL API responds, not how the Apollo Cache
        // responds (which can be different: it doesn't cache errors!)
        fetchPolicy: 'no-cache',
        // The GraphQL api might send back partial data + partial errors. We
        // want it all.
        errorPolicy: 'all',
      })
        .then(result => {
          console.log('Fetched data:', result);
          return result;
        })
        .catch(error => {
          console.error(`${type} error:`, error);
          if (error.graphQLErrors) {
            return { errors: error.graphQLErrors };
          } else {
            return { errors: [error] };
          }
        })
    );
  };
}

Cypress.Commands.add('graphql_query', graphqlOperation('query'));
Cypress.Commands.add('graphql_mutate', graphqlOperation('mutate'));

Cypress.Commands.add('loginToKeystone', (identity, secret) => {
  cy.visit('/admin');

  cy.get('input[name="identity"]').clear({ force: true }).type(identity, { force: true });

  cy.get('[name="secret"]').clear({ force: true }).type(secret, { force: true });

  cy.get('button[type="submit"]').click({ force: true });

  // Wait for page to load (completing the signin round trip)
  cy.get('main h1').should('contain', 'Dashboard');
});
