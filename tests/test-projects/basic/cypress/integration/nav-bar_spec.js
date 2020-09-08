describe('Nav Bar', () => {
  before(() => cy.visit('/reset-db'));

  // Testing links which should open in a new tab is a bit tricky in Cypress.
  // The discussion at this page lists some of the details.
  // https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/testing-dom__tab-handling-links/cypress/integration/tab_handling_anchor_links_spec.js
  [
    { text: 'Dashboard', target: '/admin' },
    { text: 'Users', target: '/admin/users' },
    { text: 'Posts', target: '/admin/posts' },
    { text: 'Post Categories', target: '/admin/post-categories' },
    {
      text: 'Keystone on GitHub',
      target: 'https://github.com/keystonejs/keystone',
      newTab: true,
    },
    { text: 'GraphQL Playground', target: '/admin/graphiql', newTab: true },
  ].forEach(({ text, target, newTab = false }) => {
    it(`${newTab ? 'Check' : 'Click'} ${text}`, () => {
      cy.visit('/admin');

      cy.get('nav').contains(text).should('have.attr', 'href', target);
      if (newTab) {
        cy.get('nav').contains(text).should('have.attr', 'target', '_blank');
      } else {
        cy.get('nav').contains(text).click({ force: true });
        cy.url().should('include', target);
      }
    });
  });
});
