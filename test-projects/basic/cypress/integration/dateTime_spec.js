import {
  format,
  subMonths,
  setMonth,
  setMinutes,
  setHours,
  setYear,
  getMonth,
  getHours,
  addMinutes,
  subMinutes,
  getYear,
  addDays,
} from 'date-fns';

const today = setMinutes(new Date(), 0);
const path = '/admin/users?fields=_label_%2Cdob%2ClastOnline';
const lastOnline = '2018-08-16T11:08:18.886+10:00';

const calendarDayInputSelector = `#ks-daypicker-dob`;
const dateTimeInputSelector = `#ks-input-lastOnline`;

const getCellFromSecondRow = index =>
  `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

describe('CalendarDay Component - Formatting', () => {
  beforeEach(() => {
    cy.visit(path);
  });

  it('should format date correctly on the list page', () => {
    cy.get(getCellFromSecondRow(3)).contains('1st January 1990');
  });

  it('should format date correctly on the details page', () => {
    cy.get(getCellFromSecondRow(2)).click();
    cy.get(calendarDayInputSelector).should('have.value', '1st January 1990');
  });
});

describe('CalendarDay Component - Functionality', () => {
  beforeEach(() => {
    cy.visit(path);
    cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2)`).click();
  });

  it(`can accept natural language like tomorrow`, () => {
    cy.get(calendarDayInputSelector).type('tomorrow');
    cy.get('label:contains("Name")').click();
    cy.get(calendarDayInputSelector).should(
      'have.value',
      format(addDays(new Date(), 1), 'Do MMMM YYYY')
    );
  });

  it(`can accept a date`, () => {
    cy.get(calendarDayInputSelector).type('20 september 2015');
    cy.get('label:contains("Name")').click();
    cy.get(calendarDayInputSelector).should('have.value', '20th September 2015');
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
    cy.get(dateTimeInputSelector).should('have.value', '11:08 AM 16th August 2018 +10:00');
  });
});

describe('DateTime Component - Functionality', () => {
  before(() => {
    cy.visit(path);
    cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2)`).click();
  });

  it(`can select a day in this month`, () => {
    cy.get('button:contains("Set Date & Time")').click();
    cy.get(getDaySelector(today)).click();
    cy.get('input[name=time-picker]')
      .click()
      .type(format(today, 'HH:mm'));

    cy.get('#ks-input-lastOnline-picker-offset input')
      .click({ force: true })
      .type(`00:00{downarrow}{enter}`, { force: true });

    cy.get('label:contains("Name")').click();
    cy.get(
      `button:contains("${format(
        subMinutes(today, today.getTimezoneOffset()),
        'MM/DD/YYYY h:mm A'
      )}")`
    ).should('exist');
  });

  it(`can use arrows to set month`, () => {
    cy.get('#ks-input-dob').click();
    cy.get(getMonthSelector(today)).scrollIntoView();
    cy.get(`button:contains("Previous Month")`)
      .click()
      .click();
    cy.get(`#ks-select-month`).should('have.value', `${subMonths(today, 2).getMonth()}`);
  });
});
