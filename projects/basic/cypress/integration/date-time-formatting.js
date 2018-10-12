import format from 'date-fns/format';

const dob = '1st January 1990';
const lastOnline = format('2018-08-16T11:08:18.886+10:00', 'MM/DD/YYYY h:mm A');

it('should format date times and calendar days according to the format option on the list page', () => {
  cy.visit('/admin/users?fields=name%2Cemail%2Cdob%2ClastOnline');

  cy.get('#ks-list-table tbody > :nth-child(2) > :nth-child(5)').contains(dob);
  cy.get('#ks-list-table tbody > :nth-child(2) > :nth-child(6)').contains(lastOnline);
});

it('should format date times and calendar days according to the format option on the details page', () => {
  cy.visit('/admin/users?fields=name%2Cemail%2Cdob%2ClastOnline');

  cy.get('#ks-list-table tbody > :nth-child(2) > :nth-child(2)').click();
  cy.get('#ks-input-dob').contains(dob);
  cy.get('#ks-input-lastOnline').contains(lastOnline);
});
