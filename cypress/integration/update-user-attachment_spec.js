describe('Adding a file', function() {
  it('should upload a file with success', function() {
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
        const fileContent = `Some important content ${Math.random()}`;
        cy.visit(`http://localhost:3000/admin/users/${user.id}`);
        cy.writeFile('cypress/mock/upload.txt', fileContent);
        cy.upload_file(
          'input[name=attachment][type=file]',
          '../mock/upload.txt'
        );
        cy.get('button[type="submit"]').click();
        cy.contains('upload.txt');
        return cy
          .graphql_query(
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
