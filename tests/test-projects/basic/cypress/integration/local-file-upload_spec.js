describe('Adding a file', function () {
  before(() => cy.visit('/reset-db'));

  it('should upload a file with success', function () {
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
          const fileContent = `Some important content ${Math.random()}`;
          cy.visit(`/admin/users/${user.id}`);
          cy.writeFile('cypress/mock/upload.txt', fileContent);
          cy.get('input[name=attachment][type=file]').attachFile({
            filePath: '../mock/upload.txt',
            mimeType: 'text/plain',
          });

          // Setup to track XHR requests
          cy.server();
          // Alias the graphql request route
          cy.route('post', '**/admin/api').as('graphqlPost');
          // Avoid accidentally mocking routes
          cy.server({ enable: false });

          cy.get('button[type="submit"]').click({ force: true });
          cy.contains('upload.txt');
          cy.wait('@graphqlPost');
          // There's a race condition somewhere. If we don't wait, the query
          // returns `null` for attachment (ie; there isn't one). This makes me
          // think the server is returning too soon from the file upload query,
          // but after looking through that code, it all seems ok
          // ( see: packages/fields/types/File/Implementation.js )
          cy.wait(1000);
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
            .then(
              ({
                data: {
                  User: { attachment },
                },
              }) => {
                // Assert the URL is visible in the admin UI
                cy.contains(`${attachment.publicUrl.split('/')[3].split('-')[1]}`).should(
                  'be.visible'
                );

                // Assert the file contents are what we uploaded
                cy.request(attachment.publicUrl).its('body').should('deep.eq', fileContent);
              }
            );
        }
      );
  });
});
