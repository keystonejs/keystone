describe('Adding a file', function() {
  it('should upload a file with success', function() {
    return cy.graphql_query(`
      query {
        allUsers(first: 1) {
          id
          name
        }
      }
    `).then(({ allUsers: [ user ] }) => {
      const fileContent = `Some important content ${Math.random()}`;
      cy.visit(`http://localhost:3000/admin/users/${user.id}`);
      cy.writeFile('cypress/fixtures/upload.txt', fileContent);
      cy.upload_file('input[name=attachment][type=file]', 'upload.txt');
      cy.get('button[type="submit"]').click();
      return cy.graphql_query(`
        query {
          User(id: "${user.id}") {
            attachment {
              id
              publicUrl
            }
          }
        }
      `).then(({ User: { attachment } }) => {
        // Assert the URL is visible in the admin UI
        cy.get('body').should('contain', attachment.publicUrl);

        // Assert the file contents are what we uploaded
        cy.request(attachment.publicUrl).its('body').should('deep.eq', fileContent);
      });
    });
  });
});
