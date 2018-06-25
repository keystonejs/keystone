describe('Loading User item', function() {
  it('should show users name', function() {
    return cy
      .graphql_query(
        'http://localhost:3000/admin/api',
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
