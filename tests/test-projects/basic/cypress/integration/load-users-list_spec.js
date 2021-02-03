describe('Loading User item', function () {
  before(() => cy.visit('/reset-db'));

  it('should show users name', function () {
    return cy
      .graphql_query(
        `${Cypress.config('baseUrl')}/admin/api`,
        `
          query {
            allUsers(first: 1) {
              id
              name
            }
          }
        `
      )
      .then(
        ({
          data: {
            allUsers: [user],
          },
        }) => {
          cy.visit(`/admin/users/${user.id}`);
          cy.get('body').should('contain', user.name);
        }
      );
  });
});
