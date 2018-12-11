import format from 'date-fns/format';

before( () => {
    cy.visit('/admin/users');
    cy.get('table tr:contains("Tom Walker") td:nth-child(2)').click();
});

describe('CalendarDay Component', () => {

    it(`should open when clicked`, () => {
        cy.get('button:contains("Set Date")').first().click();
        cy.get('#ks-daypicker-dob');
    });

    it(`can select a day in this month`, () => {
        cy.get('#ks-daypicker-dob div:contains("5")').click();
        cy.wait(1000)
    });

    it(`should close when clicked away`, () => {
        cy.get('label:contains("Name")').click();
        cy.get('#ks-daypicker-dob').should('not.exist');
    });


    //   cy.get('form[role="dialog"] button[appearance="create"]').click();
    //   cy.location('pathname').should('match', new RegExp(`${url}/.+`));

});
