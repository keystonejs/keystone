describe('Testing re-hydration', () => {
  before(() => cy.visit('/reset-db'));

  it('Our new category should appear after we add it', () => {
    cy.visit('/admin/posts');
    cy.get('button[appearance="create"]').click();
    cy.wait(150);
    cy.get('#react-select-ks-input-categories div[aria-hidden="true"]').click();
    cy.get('div[role="option"]').should('not.contain', 'New Category');

    cy.visit('/admin/post-categories');
    cy.get('button[appearance="create"]').click();
    cy.get('#ks-input-name').type('New Category');
    cy.get('form[role="dialog"] button[appearance="create"]').click();
    cy.get('body').should('contain', 'New Category');

    cy.get('nav a:contains("Posts")').click();
    cy.get('button[appearance="create"]').click();
    cy.wait(150);
    cy.get('#react-select-ks-input-categories div[aria-hidden="true"]').click();
    cy.get('div[role="option"]').should('contain', 'New Category');

    cy.visit('/admin/post-categories');
    cy.get('a:contains("New Category"):first').click();
    cy.get('button:contains("Delete"):first').click();
    cy.get('body:last footer button:first').click();
  });
});
