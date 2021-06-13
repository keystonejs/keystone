describe('table of contents', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/docs/apis/config');
  });
  it('should scroll the selected heading to view', () => {
    cy.isNotInViewport('#extend-graphql-schema');
    cy.contains('a', 'extendGraphqlSchema').click();
    cy.isInViewport('#extend-graphql-schema');
  });
  it('should highlight the closest heading', () => {
    cy.get('#extend-graphql-schema').scrollIntoView();
    // this is brittle AF. but no other way around this till we have tokens
    cy.contains('a', 'extendGraphqlSchema').should('have.css', 'color', 'rgb(38, 132, 255)');
  });
});
