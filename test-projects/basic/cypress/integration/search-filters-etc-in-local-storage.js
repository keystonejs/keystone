afterEach(() => {
  cy.clearLocalStorage();
});

it('should persist search, filters and columns after visiting a new page', () => {
  cy.visit('/admin/users?fields=name%2Cemail%2Cdob%2ClastOnline');
  cy.get('[data-field="dob"]').contains('Dob');
  cy.visit('/admin/posts');
  cy.visit('/admin/users');

  cy.get('[data-field="dob"]').contains('Dob');
});

it('should put the search parameters into the link in the nav', () => {
  cy.visit('/admin/users?fields=name%2Cemail%2Cdob%2ClastOnline');
  cy.get('[data-field="dob"]').contains('Dob');
  cy.visit('/admin/posts');
  cy.get('#ks-nav-users').click({ force: true });
  cy.get('[data-field="dob"]').contains('Dob');
});
