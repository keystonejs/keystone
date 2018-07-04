describe('Adding a file', function() {
  before(() => cy.visit('/reset-db'));

  it('should upload a file with success', function() {
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
      .then(({ allUsers: [user] }) => {
        const fileContent = `Some important content ${Math.random()}`;
        cy.visit(`/admin/users/${user.id}`);
        cy.writeFile('cypress/mock/upload.txt', fileContent);
        cy.upload_file(
          'input[name=attachment][type=file]',
          '../mock/upload.txt'
        );

        // Setup to track XHR requests
        cy.server();
        // Alias the graphql request route
        cy.route('post', '**/admin/api').as('graphqlPost');
        // Avoid accidentally mocking routes
        cy.server({ enable: false });

        cy.get('button[type="submit"]').click();
        cy.contains('upload.txt');
        cy.wait('@graphqlPost');
        return cy
          .graphql_query(
            `${Cypress.config('baseUrl')}/admin/api`,
            `
              query {
                User(where: { id: "${user.id}" }) {
                  attachment {
                    id
                    publicUrl
                  }
                }
              }
            `
          )
          .then(({ User: { attachment } }) => {
            // Assert the URL is visible in the admin UI
            cy
              .contains(`${attachment.publicUrl.split('/')[3]}`)
              .should('be.visible');

            // Assert the file contents are what we uploaded
            cy
              .request(attachment.publicUrl)
              .its('body')
              .should('deep.eq', fileContent);
          });
      });
  });
});
