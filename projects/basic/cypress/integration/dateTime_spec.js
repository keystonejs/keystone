import {
    format,
    subMonths,
    setMonth,
    setMinutes,
    setHours,
    setYear,
    getMonth,
} from 'date-fns';

const today = setMinutes(setHours(new Date(), 17), 55);
const path = '/admin/users?fields=_label_%2Cdob%2ClastOnline';
const lastOnline = '2018-08-16T11:08:18.886+10:00';

const getDateButtonSetTo = date => `button:contains("${format(date, 'Do MMMM YYYY')}")`;
const getDateTimeButtonSetTo = date => `button:contains("${format(date, 'MM/DD/YYYY h:mm A')}")`;
const getDaySelector = date => `#ks-day-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
const getCellFromSecondRow = index => `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

describe('CalendarDay Component - Formatting', () => {
    beforeEach(() => {
        cy.visit(path);
    });

    it('should format date correctly on the list page', () => {
        cy.get(getCellFromSecondRow(3)).contains('1st January 1990');
    });

    it('should format date correctly on the details page', () => {
        cy.get(getCellFromSecondRow(2)).click();
        cy.get('#ks-input-dob').contains('1st January 1990');
    });
});

describe('CalendarDay Component - Functionality', () => {
    before(() => {
        cy.visit(path);
        cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2)`).click();
    });

    it(`should appear and dissapear`, () => {
        cy
            .get('button:contains("Set Date")')
            .first()
            .click();
        cy.get('#ks-daypicker-dob').should('exist');
        cy.get('label:contains("Name")').click();
        cy.get('#ks-daypicker-dob').should('not.exist');
    });

    it(`can select a day in this month`, () => {
        cy.get('button:contains("Set Date")')
            .first()
            .click();
        cy.get(getDaySelector(today)).click();
        cy.get('label:contains("Name")').click();
        cy.get(getDateButtonSetTo(today)).should('exist');
    });

    it(`can use arrows to set month`, () => {
        cy.get(getDateButtonSetTo(today)).click();
        cy.get(getDaySelector(today)).click();
        cy.get(`button:contains("Previous Month")`).click().click();
        cy.get(`#ks-select-month`).should('have.value', `${subMonths(today, 2).getMonth()}`);
    });

    it(`can use 'Select' to set month`, () => {
        cy.get(getDateButtonSetTo(today)).click();
        cy.get(`#ks-select-month`).select('Jun');
        cy.get(getDaySelector(setMonth(today, 5))).click();
        cy.get('label:contains("Name")').click();
        cy.get(getDateButtonSetTo(setMonth(today, 5)))
            .should('exist')
            .click();

        // success, resetting to previous state
        cy.log('success, resetting to previous state');
        cy.get(`#ks-select-month`).select(format(today, 'MMM'));
        cy.get(getDaySelector(today)).click();
        cy.get('label:contains("Name")').click();
    });

    it(`can use input to set year`, () => {
        cy.get(getDateButtonSetTo(today)).click();
        cy.get(`#ks-input-year`).type('{backspace}{backspace}15');
        cy.get(getDaySelector(setYear(today, 2015))).click();
        cy.get('label:contains("Name")').click();
        cy.get(getDateButtonSetTo(setYear(today, 2015)))
            .should('exist')
            .click();

        // success, resetting to previous state
        cy.log('success, resetting to previous state');
        cy.get(`#ks-input-year`).type(`{backspace}{backspace}${format(today, 'YY')}`);
        cy.get(getDaySelector(today)).click();
        cy.get('label:contains("Name")').click();
    });
});

///// Begin Date Time Component

describe('DateTime Component - Formatting', () => {
    beforeEach(() => {
        cy.visit(path);
    });

    it('should format date-time correctly on the list page', () => {
        cy.get(getCellFromSecondRow(4)).contains(format(lastOnline, 'MM/DD/YYYY h:mm A'));
    });

    it('should format date-time correctly on the details page', () => {
        cy.get(getCellFromSecondRow(2)).click();
        //cy.get('#ks-input-lastOnline').contains(lastOnline);
        cy.get(getDateTimeButtonSetTo(lastOnline))
    });
});

describe('DateTime Component - Functionality', () => {
    before( () => {
        cy.visit(path);
        cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2)`).click();
    });

    it(`should appear and dissapear`, () => {
        cy
            .get('button:contains("Set Date & Time")')
            .first()
            .click();
        cy.get('#ks-dateTimePicker-lastOnline').should('exist');
        cy.get('label:contains("Name")').click();
        cy.get('#ks-dateTimePicker-lastOnline').should('not.exist');
    });

    it(`can select a day in this month`, () => {
        cy.get('button:contains("Set Date & Time")').click();
        cy.get(getDaySelector(today)).click();
        cy.get('input[name=time-picker]').click().type('17:55');
        cy.get('input[id=react-select-5-input]').select('+10.00');
        cy.get('label:contains("Name")').click();
        cy.get(`button:contains("${format(today, 'MM/DD/YYYY h:mm A')}")`).should('exist');
    });

    // it(`can use arrows to set month`, () => {
    //     cy.get(getDateTimeButtonSetTo(today)).click();
    //     cy.get(getDaySelector(today)).click();
    //     cy.get(`button:contains("Previous Month")`).click().click();
    //     cy.get(`#ks-select-month`).should('have.value', `${subMonths(today, 2).getMonth()}`);
    // });

});
