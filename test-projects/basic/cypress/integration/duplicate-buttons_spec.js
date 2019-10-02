describe('Home page', () => {
  it('Ensure Create Modal opens inside the detail view when Duplicating, has the correct field values, and Cancels', async () => {
    const schema = "Post";
    const url = '/admin/posts';
    const data = {
      'ks-input-name': 'Post to be duplicated',
      'ks-input-slug': 'post-to-be-duplicated',
    };

    cy.visit(url);
    cy.get('#list-page-create-button').click({ force: true });

    Object.keys(data).forEach(item => {
      cy.get(`#${item}`).type(data[item], { force: true });
    });

    cy.get('#create-item-modal-submit-button').click({ force: true });

    cy.location('pathname').should('match', new RegExp(`${url}/.+`));

    Object.keys(data).forEach(item => {
      cy.get(`#${item}`).should('have.value', data[item]);
    });

    cy.get('#item-page-duplicate-button').click({ force: true });

    Object.entries(data).forEach(([field, value]) => {
      cy.get(`#${field}`).should("have.value", value);
    });
    cy.contains('div', `Create ${schema} Dialog`)
      .contains('button', 'Cancel')
      .click({ force: true });
    cy.contains('div', `Create ${schema} Dialog`).should('not.exist');
  });
});
