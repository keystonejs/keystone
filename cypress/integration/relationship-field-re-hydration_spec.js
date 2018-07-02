describe('Testing re-hydration', () => {
  before(() =>
    cy
      .task('getProjectInfo', 'basic')
      .then(({ env: { PORT } }) =>
        cy.visit(`http://localhost:${PORT}/reset-db`)
      )
  );

  it('Our new category should appear after we add it', () => {
    cy
      .task('getProjectInfo', 'basic')
      .then(({ env: { PORT } }) =>
        cy.visit(`http://localhost:${PORT}/admin/posts`)
      );
    cy.get('button[appearance="create"]').click();
    cy.wait(150);
    cy
      .get('label[for="ks-input-categories"] + div div[role="button"] > svg')
      .click();
    cy
      .get('label[for="ks-input-categories"] + div div[role="listbox"]')
      .should('not.contain', 'New Category');

    cy
      .task('getProjectInfo', 'basic')
      .then(({ env: { PORT } }) =>
        cy.visit(`http://localhost:${PORT}/admin/post-categories`)
      );
    cy.get('button[appearance="create"]').click();
    cy.get('#ks-input-name').type('New Category');
    cy.get('#app ~ div button[appearance="create"]').click();
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

    cy
      .task('getProjectInfo', 'basic')
      .then(({ env: { PORT } }) =>
        cy.visit(`http://localhost:${PORT}/admin/post-categories`)
      );
    cy.get('a:contains("New Category"):first').click();
    cy.get('button:contains("Delete"):first').click();
    cy.get('body:last footer button:first').click();
  });
});
