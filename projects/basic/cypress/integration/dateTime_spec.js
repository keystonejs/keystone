import { format, subMonths } from 'date-fns';

const date = new Date;
const dob = '1st January 1990';
const lastOnline = format('2018-08-16T11:08:18.886+10:00', 'MM/DD/YYYY h:mm A');
const path = '/admin/users?fields=_label_%2Cdob%2ClastOnline';

const selectCellFromSecondRow = index => `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

describe('CalendarDay Component - Formatting', () => {

    beforeEach( () => {
        cy.visit(path);
    });

    it('should format date correctly on the list page', () => {
        cy.get(selectCellFromSecondRow(3)).contains(dob);
    });


    it('should format date correctly on the details page', () => {
        cy.get(selectCellFromSecondRow(2)).click();
        cy.get('#ks-input-dob').contains(dob);
    });

});

describe('CalendarDay Component - Functionality', () => {
    before( () => {
        cy.visit(path);
        cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2)`).click();
    });

    it(`should open when clicked`, () => {
        cy.get('button:contains("Set Date")').first().click();
        cy.get('#ks-daypicker-dob');
    });

    it(`can select a day in this month`, () => {
        cy.get('div[id*="ks-day-12-"]').last().click();
        cy.get(`#ks-day-${format(subMonths(date, 1), 'D-M-YYYY')}`).click();

        cy.wait(1000)
    });

    it(`should close when clicked away`, () => {
        cy.get('label:contains("Name")').click();
        cy.get('#ks-daypicker-dob').should('not.exist');
    });
});




describe('DateTime Component - Formatting', () => {

    beforeEach( () => {
        cy.visit(path);
    });

    it('should format date-time correctly on the list page', () => {
        cy.get(selectCellFromSecondRow(4)).contains(lastOnline);
    });


    it('should format date-time correctly on the details page', () => {
        cy.get(selectCellFromSecondRow(2)).click();
        cy.get('#ks-input-lastOnline').contains(lastOnline);
    });

});

// describe('DateTime Component - Functionality', () => {
//     before( () => {
//         cy.visit(path);
//         cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2)`).click();
//     });

//     it(`should open when clicked`, () => {
//         cy.get('button:contains("Set Date & Time")').first().click();
//         cy.get('#ks-daypicker-lastonline');
//     });

//     it(`can select a day in this month`, () => {
//         cy.get('div[id*="ks-day-12-"]').last().click();
//         cy.get(`#ks-day-${format(subMonths(date, 1), 'D-M-YYYY')}`).click();
//         cy.wait(1000)
//     });

//     it(`should close when clicked away`, () => {
//         cy.get('label:contains("Name")').click();
//         cy.get('#ks-daypicker-dob').should('not.exist');
//     });
// });
