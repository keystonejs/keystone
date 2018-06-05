describe('Testing re-hydration', () => {
  before(() => {
    cy.visit('http://localhost:3000/reset-db');
  });

  it('Our new category should appear after we add it', () => {
    cy.visit('http://localhost:3000/admin/posts');
    cy.get('button[appearance="create"]').click();
    cy.wait(150);
    cy
      .get('label[for="ks-input-categories"] + div div[role="button"] > svg')
      .click();
    cy
      .get('label[for="ks-input-categories"] + div div[role="listbox"]')
      .should('not.contain', 'New Category');

    cy.visit('http://localhost:3000/admin/post-categories');
    cy.get('button[appearance="create"]').click();
    cy.get('#ks-input-name').type('New Category');
    cy.get('div[class*="Dialog"] button[appearance="create"]').click();
    cy.get('body').should('contain', 'New Category');

    cy.get('nav a:contains("Posts")').click();
    cy.get('button[appearance="create"]').click();
    cy.wait(150);
    cy
      .get('label[for="ks-input-categories"] + div div[role="button"] > svg')
      .click();
    cy
      .get('label[for="ks-input-categories"] + div div[role="listbox"]')
      .should('contain', 'New Category');

    cy.visit('http://localhost:3000/admin/post-categories');
    cy.get('a:contains("New Category"):first').click();
    cy.get('button:contains("Delete"):first').click();
    cy.get('body:last footer button:first').click();
  });
});
