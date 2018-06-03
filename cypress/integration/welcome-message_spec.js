describe('Test Project Smoke Tests', () => {
  it('Should be able to access welcome message /', () => {
    cy.visit('http://localhost:3000/');

    cy.get('body').should('contain', 'Welcome');
  });

  it('Should be able to click through to admin page.', () => {
    cy.visit('http://localhost:3000/');

    cy.contains('Open').click();

    cy.url().should('include', '/admin');
  });
});
