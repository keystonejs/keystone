describe('Testing re-hydration', () => {
  before(() => cy.visit('/reset-db'));

  it('Our new category should appear after we add it', () => {
    function clickCategoriesSelect() {
      // Wait for the select box to be rendered
      cy.get('#react-select-ks-input-categories div[aria-hidden="true"]');
      // Wait for any re-renders to happen which accidentally destroy the select
      // box
      cy.wait(150);
      // And now select and click the actually rendered element.
      cy.get('#react-select-ks-input-categories div[aria-hidden="true"]')
        .first()
        .click();
    }

    cy.visit('/admin/posts');
    cy.get('#list-page-create-button').click();

    clickCategoriesSelect();

    cy.get('div[role="option"]').should('not.contain', 'New Category');

    cy.visit('/admin/post-categories');
    cy.get('#list-page-create-button').click();
    cy.get('#ks-input-name').type('New Category');
    cy.get('#create-item-modal-submit-button').click();
    cy.get('body').should('contain', 'New Category');

    cy.get('nav a:contains("Posts")').click();
    cy.get('#list-page-create-button').click();

    clickCategoriesSelect();

    cy.get('div[role="option"]').should('contain', 'New Category');

    cy.visit('/admin/post-categories');
    cy.get('a:contains("New Category"):first').click();
    cy.get('button:contains("Delete"):first').click();
    cy.get('body:last footer button:first').click();
  });
});
