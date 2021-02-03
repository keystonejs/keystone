describe('Test Project Smoke Tests', () => {
  it('Should be able to access welcome message /', () => {
    cy.visit('/');

    cy.get('body').should('contain', 'Welcome');
  });

  it('Should be able to click through to admin page.', () => {
    cy.visit('/');

    cy.contains('Open').click({ force: true });

    cy.url().should('include', '/admin');
  });
});
