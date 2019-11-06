describe('Adding users', () => {
  [
    { error: 'Password is required', data: {} },
    { error: 'Password must be at least 8 characters', data: { 'ks-input-password': 'pass' } },
    { error: 'Passwords do not match', data: { 'ks-input-password': 'password' } },
  ].forEach(({ data, error }) => {
    it(`Displays ${error} error`, () => {
      cy.visit('/admin/users');
      cy.get('#list-page-create-button').click({ force: true });

      Object.keys(data).forEach(item => {
        if (item === 'ks-input-password') {
          cy.get(`#ks-input-password-button`).click({ force: true });
        }

        cy.get(`#${item}`).type(data[item], { force: true });
      });

      // Why force? Because Cypress has lots of issues with determining
      // clickability:
      // https://github.com/cypress-io/cypress/labels/topic%3A%20visibility%20%F0%9F%91%81
      cy.get('#create-item-modal-submit-button').click({ force: true });
      cy.get('form').should('contain', error);
    });
  });

  it(`Creates the user`, () => {
    cy.visit('/admin/users');
    cy.get('#list-page-create-button').click({ force: true });

    cy.get('#ks-input-name').type('John Doe', { force: true });
    cy.get('#ks-input-email').type('john@gmail.com', { force: true });
    cy.get('#ks-input-password-button').click({ force: true });
    cy.get('#ks-input-password').type('password', { force: true });
    cy.get('#ks-input-password-confirm').type('password', { force: true });

    cy.get('#create-item-modal-submit-button').click({ force: true });

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
      cy.get(`a:contains("John Doe"):first`).click({ force: true });

      Object.keys(data).forEach(item => {
        if (item === 'ks-input-password') {
          cy.get(`#ks-input-password-button`).click({ force: true });
        }

        if (!data[item]) {
          cy.get(`#${item}`).type(' ', { force: true });
          cy.get(`#${item}`).clear();
        } else {
          cy.get(`#${item}`).type(data[item]);
        }
      });

      cy.get('#item-page-save-button').click({ force: true });
      cy.get('form').should('contain', error);
    });
  });

  it('Updated data', () => {
    cy.visit('/admin/users');
    cy.get(`a:contains("John Doe"):first`).click({ force: true });

    cy.get('#ks-input-name').clear();
    cy.get('#ks-input-name').type('test name', { force: true });
    cy.get(`#ks-input-password-button`).click({ force: true });
    cy.get(`#ks-input-password`).type('new password', { force: true });
    cy.get(`#ks-input-password-confirm`).type('new password', { force: true });

    cy.get('#item-page-save-button').click({ force: true });
    cy.wait(500);
    cy.get(`nav a:contains("Users")`).click({ force: true });
    cy.get('body').should('contain', 'test name');
  });
});
