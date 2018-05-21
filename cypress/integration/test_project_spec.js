describe('Test Project Smoke Tests', function() {
  it('Should be able to access welcome message /', function() {
    cy.visit('http://localhost:3000/');

    cy.get('body').should('contain', 'Welcome');
  });
});
