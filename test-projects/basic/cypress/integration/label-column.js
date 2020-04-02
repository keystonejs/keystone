it('should have a label column by default', () => {
  cy.visit('/admin/users');
  cy.get('[data-field="_label_"]').contains('Label');
  cy.get('[data-field="_label_"]').then(nodes => {
    expect(nodes).to.have.length(1);
    let index = [...nodes[0].parentNode.children].indexOf(nodes[0]);
    cy.get(
      `#ks-list-table tbody > :nth-child(1) > :nth-child(${
        // add one since :nth-child begins at one whereas array indexes start at 0
        index + 1
      })`
    ).contains('Ben Conolly <ben@keystone.com>');
  });
});
