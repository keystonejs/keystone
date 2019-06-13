describe('Adding users', () => {
  [
    { error: 'Password is required', data: {} },
    { error: 'Password must be at least 8 characters', data: { 'ks-input-password': 'pass' } },
    { error: 'Passwords do not match', data: { 'ks-input-password': 'password' } },
  ].forEach(({ data, error }) => {
    it(`Displays ${error} error`, () => {
      cy.visit('/admin/users');
      cy.get('#list-page-create-button').click();

      Object.keys(data).forEach(item => {
        if (item === 'ks-input-password') {
          cy.get(`#ks-input-password-button`).click();
        }

        cy.get(`#${item}`).type(data[item]);
      });

      cy.get('#create-item-modal-submit-button').click();
      cy.get('form').should('contain', error);
    });
  });

  it(`Creates the user`, () => {
    cy.visit('/admin/users');
    cy.get('#list-page-create-button').click();

    cy.get('#ks-input-name').type('John Doe');
    cy.get('#ks-input-email').type('john@gmail.com');
    cy.get('#ks-input-password-button').click();
    cy.get('#ks-input-password').type('password');
    cy.get('#ks-input-password-confirm').type('password');

    cy.get('#create-item-modal-submit-button').click();

    cy.location('pathname').should('match', new RegExp(`/admin/users/.+`));

    cy.get('#ks-input-name').should('have.value', 'John Doe');
    cy.get('#ks-input-email').should('have.value', 'john@gmail.com');
  });
});

describe('Editing data', () => {
  [
    { error: 'Password is required', data: { 'ks-input-password': '' } },
    { error: 'Password must be at least 8 characters', data: { 'ks-input-password': 'pass' } },
    { error: 'Passwords do not match', data: { 'ks-input-password': 'password' } },
  ].forEach(({ data, error }) => {
    it(`Displays ${error} error`, () => {
      cy.visit('/admin/users');
      cy.get(`a:contains("John Doe"):first`).click();

      Object.keys(data).forEach(item => {
        if (item === 'ks-input-password') {
          cy.get(`#ks-input-password-button`).click();
        }

        if (!data[item]) {
          cy.get(`#${item}`).type(' ');
          cy.get(`#${item}`).clear();
        } else {
          cy.get(`#${item}`).type(data[item]);
        }
      });

      cy.get('#item-page-save-button').click();
      cy.get('form').should('contain', error);
    });
  });

  it('Updated data', () => {
    cy.visit('/admin/users');
    cy.get(`a:contains("John Doe"):first`).click();

    cy.get('#ks-input-name').clear();
    cy.get('#ks-input-name').type('test name');
    cy.get(`#ks-input-password-button`).click();
    cy.get(`#ks-input-password`).type('new password');
    cy.get(`#ks-input-password-confirm`).type('new password');

    cy.get('#item-page-save-button').click();
    cy.get(`nav a:contains("Users")`).click();
    cy.get('body').should('contain', 'test name');
  });
});
