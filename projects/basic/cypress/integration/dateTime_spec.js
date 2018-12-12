import { format, subMonths, setMonth, setYear, getMonth } from 'date-fns';

const today = new Date;
const path = '/admin/users?fields=_label_%2Cdob%2ClastOnline';
const lastOnline = format('2018-08-16T11:08:18.886+10:00', 'MM/DD/YYYY h:mm A');

const selectCellFromSecondRow = index => `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

describe('CalendarDay Component - Formatting', () => {
    beforeEach( () => {
        cy.visit(path);
    });

    it('should format date correctly on the list page', () => {
        cy.get(selectCellFromSecondRow(3)).contains('1st January 1990');
    });

    it('should format date correctly on the details page', () => {
        cy.get(selectCellFromSecondRow(2)).click();
        cy.get('#ks-input-dob').contains('1st January 1990');
    });
});

describe('CalendarDay Component - Functionality', () => {
    before( () => {
        cy.visit(path);
        cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2)`).click();
    });

    it(`should appear and dissapear`, () => {
        cy.get('button:contains("Set Date")').first().click();
        cy.get('#ks-daypicker-dob').should('exist');
        cy.get('label:contains("Name")').click();
        cy.get('#ks-daypicker-dob').should('not.exist');
    });

    it(`can select a day in this month`, () => {
        cy.get('button:contains("Set Date")').first().click();
        cy.get(`#ks-day-${format(subMonths(today, 1), 'D-M-YYYY')}`).click();
        cy.get('label:contains("Name")').click();
        cy.get(`button:contains("${format(today, 'Do MMMM YYYY')}")`).should('exist');
    });

    it(`can use arrows to set month`, () => {
        cy.get(`button:contains("${format(today, 'Do MMMM YYYY')}")`).click();
        cy.get(`#ks-day-${format(subMonths(today, 1), 'D-M-YYYY')}`).click();
        cy.get(`button:contains("Previous Month")`).click();
        cy.get(`#ks-select-month`).should('have.value', `${subMonths(today, 1).getMonth()}`);
    });

    it(`can use 'Select' to set month`, () => {
        cy.get(`button:contains("${format(today, 'Do MMMM YYYY')}")`).click();
        cy.get(`#ks-select-month`).select('Jun');
        cy.get(`#ks-day-${format(setMonth(today, 4), 'D-M-YYYY')}`).click();
        cy.get('label:contains("Name")').click();
        cy.get(`button:contains("${format(setMonth(today, 5), 'Do MMMM YYYY')}")`).should('exist').click();

        // success, resetting to previous state
        cy.log('success, resetting to previous state');
        cy.get(`#ks-select-month`).select(format(today,'MMM'));
        cy.get(`#ks-day-${format(subMonths(today, 1), 'D-M-YYYY')}`).click();
        cy.get('label:contains("Name")').click();
    });

    it(`can use input to set year`, () => {
        cy.get(`button:contains("${format(today, 'Do MMMM YYYY')}")`).click();
        cy.get(`#ks-input-year`).type('{backspace}{backspace}15');
        cy.get(`#ks-day-${format(setYear(subMonths(today, 1), 2015), 'D-M-YYYY')}`).click();
        cy.get('label:contains("Name")').click();
        cy.get(`button:contains("${format(setYear(today, 2015), 'Do MMMM YYYY')}")`).should('exist').click();

        // success, resetting to previous state
        cy.log('success, resetting to previous state');
        cy.get(`#ks-input-year`).type(`{backspace}{backspace}${format(today, 'YY')}`);
        cy.get(`#ks-day-${format(subMonths(today, 1), 'D-M-YYYY')}`).click();
        cy.get('label:contains("Name")').click();
    });
});


///// Begin Date Time Component


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
