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
        // It's there, it's visible in the recordings, but Cypress _sometimes_
        // refuses to click it.
        // See an image of it incorrectly failing here:
        // https://17680-128193054-gh.circle-artifacts.com/0/tmp/screenshots/relationship-field-re-hydration_spec.js/Testing%20re-hydration%20--%20Our%20new%20category%20should%20appear%20after%20we%20add%20it%20%28failed%29.png
        .click({ force: true });
    }

    cy.visit('/admin/posts');
    cy.get('#list-page-create-button').click({ force: true });

    clickCategoriesSelect();

    cy.get('div[role="option"]').should('not.contain', 'New Category');

    cy.visit('/admin/post-categories');
    cy.get('#list-page-create-button').click({ force: true });
    cy.get('#ks-input-name').type('New Category', { force: true });
    cy.get('#create-item-modal-submit-button').click({ force: true });
    cy.get('body').should('contain', 'New Category');

    cy.get('nav a:contains("Posts")').click({ force: true });
    cy.get('#list-page-create-button').click({ force: true });

    clickCategoriesSelect();

    cy.get('div#react-select-ks-input-categories-option-6').should('contain', 'New Category');

    cy.visit('/admin/post-categories');
    cy.get('a:contains("New Category"):first').click({ force: true });
    cy.get('button:contains("Delete"):first').click({ force: true });
    cy.get('body:last footer button:first').click({ force: true });
  });
});
