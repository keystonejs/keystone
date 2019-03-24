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
import moment from 'moment';

const today = setMinutes(new Date(), 0);
const path = '/admin/users?fields=_label_%2Cdob%2ClastOnline';
const lastOnline = '2018-08-16T11:08:18.886+10:00';

const calendarDayInputSelector = `#ks-daypicker-dob`;
const dateTimeInputSelector = `#ks-input-lastOnline`;

const getCellFromSecondRow = index =>
  `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

beforeEach(() => {
  cy.clock(1551628922000);
});

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

  it('can accept natural language like today', () => {
    cy.get(calendarDayInputSelector).type('today');
    cy.get('label:contains("Name")').click();

    cy.get(calendarDayInputSelector).should('have.value', '3rd March 2019');
  });

  it(`can accept natural language like tomorrow`, () => {
    cy.get(calendarDayInputSelector).type('tomorrow');
    cy.get('label:contains("Name")').click();
    cy.get(calendarDayInputSelector).should('have.value', '4th March 2019');
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

  it('can accept natural language like today at 4pm', () => {
    cy.get(dateTimeInputSelector).type('today at 4pm');
    cy.get('label:contains("Name")').click();

    cy.get(dateTimeInputSelector).should('have.value', '4:00 PM 3rd March 2019 +00:00');
  });

  it('can accept natural language like tomorrow at 4pm', () => {
    cy.get(dateTimeInputSelector)
      .clear()
      .type('tomorrow at 4pm');
    cy.get('label:contains("Name")').click();

    cy.get(dateTimeInputSelector).should('have.value', '4:00 PM 4th March 2019 +00:00');
  });

  it(`can accept a date time`, () => {
    cy.get(dateTimeInputSelector)
      .clear()
      .type('1:28 am 12 september 2018 +10:00');
    cy.get('label:contains("Name")').click();
    cy.get(dateTimeInputSelector).should('have.value', '1:28 AM 12th September 2018 +10:00');
  });
});
