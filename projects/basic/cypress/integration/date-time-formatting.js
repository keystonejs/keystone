import format from 'date-fns/format';

let dob = '1st January 1990';
let lastOnline = '08/16/2018 11:08 AM';

it('should format date times and calendar days according to the format option on the list page', () => {
  cy.visit('/admin/users?fields=name%2Cemail%2Cdob%2ClastOnline');

  cy.get('#ks-list-table tbody > :nth-child(2) > :nth-child(4)').contains(dob);
  cy.get('#ks-list-table tbody > :nth-child(2) > :nth-child(5)').contains(lastOnline);
});

it('should format date times and calendar days according to the format option on the details page', () => {
  cy.visit('/admin/users?fields=name%2Cemail%2Cdob%2ClastOnline');

  cy.get('#ks-list-table tbody > :nth-child(2) > :nth-child(2)').click();
  cy.get('#ks-input-dob').contains(dob);
  cy.get('#ks-input-lastOnline').contains(lastOnline);
});
