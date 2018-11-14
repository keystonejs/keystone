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
  cy.get('#ks-nav-users').click();
  cy.get('[data-field="dob"]').contains('Dob');
});

it('the reset button should remove all search, filters and etc.', () => {
  cy.visit('/admin/users?fields=name%2Cemail%2Cdob%2ClastOnline');
  cy.get('#ks-list-dropdown').click();
  cy.get('#ks-list-dropdown-reset').click();
  cy.get('#ks-list-table thead tr').then(nodes => {
    expect(nodes).to.have.lengthOf(1);
    expect(nodes[0].children).to.have.lengthOf(5);
  });
});
