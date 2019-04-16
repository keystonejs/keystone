describe('Home page', () => {
  [
    { text: 'Users', target: 'users' },
    { text: 'Posts', target: 'posts' },
    { text: 'Post Categories', target: 'post-categories' },
  ].forEach(({ text, target }) => {
    it(`Click through to list page - ${text}`, () => {
      cy.visit('/admin');
      cy.contains(`Go to ${text}`)
        .should('have.attr', 'href', `/admin/${target}`)
        .should('have.attr', 'title', `Go to ${text}`)
        .click();

      cy.url().should('include', target);
    });
  });

  it('Create list buttons exists', () => {
    cy.visit('/admin');
    [{ text: 'User' }, { text: 'Post' }, { text: 'Post Category' }].forEach(({ text }) => {
      cy.contains('button', `Create ${text}`).should('have.attr', 'title', `Create ${text}`);
    });
  });

  it('Ensure Create Modal opens, has the correct fields, and Cancels', () => {
    cy.visit('/admin');
    [
      {
        text: 'User',
        labels: ['Name', 'Email', 'Password', 'Company'],
      },
      {
        text: 'Post',
        labels: ['Name', 'Slug', 'Status', 'Author', 'Categories'],
      },
      { text: 'Post Category', labels: ['Name', 'Slug'] },
    ].forEach(({ text, labels }) => {
      cy.contains('button', `Create ${text}`).click();
      cy.contains('div', `Create ${text} Dialog`).contains('h3', `Create ${text}`);
      cy.contains('div', `Create ${text} Dialog`).contains('button', 'Create');
      labels.forEach(label => {
        cy.contains('div[data-selector="field-container"]', label);
      });
      cy.contains('div', `Create ${text} Dialog`)
        .contains('button', 'Cancel')
        .click();
      cy.contains('div', `Create ${text} Dialog`).should('not.exist');
    });
  });

  it('Ensure Create Modal opens inside the detail view, has the correct fields, and Cancels', () => {
    cy.visit('/admin/users');

    cy.get('a[href^="/admin/users/"]:first').click();
    cy.get('#item-page-create-button').click();

    [
      {
        text: 'User',
        labels: ['Name', 'Email', 'Password', 'Company'],
      },
    ].forEach(({ text, labels }) => {
      cy.contains('div', `Create ${text} Dialog`).contains('h3', `Create ${text}`);
      cy.contains('div', `Create ${text} Dialog`).contains('button', 'Create');
      labels.forEach(label => {
        cy.contains('div[data-selector="field-container"]', label);
      });
      cy.contains('div', `Create ${text} Dialog`)
        .contains('button', 'Cancel')
        .click();
      cy.contains('div', `Create ${text} Dialog`).should('not.exist');
    });
  });
});
