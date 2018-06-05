describe('Loading User item', function() {
  before(() => {
    cy.visit('http://localhost:3000/reset-db');
  });

  it('should show users name', function() {
    return cy
      .graphql_query(
        `
          query {
            allUsers(first: 1) {
              id
              name
            }
          }
        `
      )
      .then(({ allUsers: [user] }) => {
        cy.visit(`http://localhost:3000/admin/users/${user.id}`);
        cy.get('body').should('contain', user.name);
      });
  });
});
