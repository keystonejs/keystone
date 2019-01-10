import format from 'date-fns/format';

const dob = '1st January 1990';
const lastOnline = format('2018-08-16T11:08:18.886+10:00', 'MM/DD/YYYY h:mm A');
const path = '/admin/users?fields=_label_%2Cdob%2ClastOnline';
const selectCellFromSecondRow = index =>
  `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

it('should format date times and calendar days according to the format option on the list page', () => {
  cy.visit(path);

  cy.get(selectCellFromSecondRow(3)).contains(dob);
  cy.get(selectCellFromSecondRow(4)).contains(lastOnline);
});

it('should format date times and calendar days according to the format option on the details page', () => {
  cy.visit(path);

  cy.get(selectCellFromSecondRow(2)).click();
  cy.get('#ks-input-dob').contains(dob);
  cy.get('#ks-input-lastOnline').contains(lastOnline);
});
