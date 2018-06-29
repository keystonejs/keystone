describe('Loading User item', function() {
  before(() =>
    cy
      .task('getProjectInfo', 'basic')
      .then(({ env: { PORT } }) =>
        cy.visit(`http://localhost:${PORT}/reset-db`)
      )
  );

  it('should show users name', function() {
    cy.task('getProjectInfo', 'basic').then(({ env: { PORT } }) => {
      return cy
        .graphql_query(
          `http://localhost:${PORT}/admin/api`,
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
          cy.visit(`http://localhost:${PORT}/admin/users/${user.id}`);
          cy.get('body').should('contain', user.name);
        });
    });
  });
});
