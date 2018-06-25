describe('Test Project Smoke Tests', () => {
  it('Should be able to access welcome message /', () => {
    cy.task('getProjectInfo', 'basic').then(({ env: { PORT } }) => (
      cy.visit(`http://localhost:${PORT}/`)
    ));

    cy.get('body').should('contain', 'Welcome');
  });

  it('Should be able to click through to admin page.', () => {
    cy.task('getProjectInfo', 'basic').then(({ env: { PORT } }) => (
      cy.visit(`http://localhost:${PORT}/`)
    ));

    cy.contains('Open').click();

    cy.url().should('include', '/admin');
  });
});
