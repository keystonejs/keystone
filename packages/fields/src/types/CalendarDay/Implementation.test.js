import { CalendarDay } from './Implementation';

const mocks = {
  listAdapter: { newFieldAdapter: () => {} },
  defaultAccess: true,
  schemaNames: ['public'],
};

describe('CalendarDay#implementation', () => {
  it('Instantiates correctly if dateFrom is before dateTo', () => {
    expect(() => {
      new CalendarDay('date', { dateFrom: '2000-01-01', dateTo: '2001-01-01' }, mocks);
    }).not.toThrow();
  });

  it('Instantiates correctly with only dateFrom', () => {
    expect(() => {
      new CalendarDay('date', { dateFrom: '2000-01-01' }, mocks);
    }).not.toThrow();
  });

  it('Instantiates correctly with only dateTo', () => {
    expect(() => {
      new CalendarDay('date', { dateTo: '2000-01-01' }, mocks);
    }).not.toThrow();
  });

  describe('error handling', () => {
    it("throws if 'dateTo' is before 'dateFrom'", () => {
      return expect(
        () => new CalendarDay('date', { dateTo: '2000-01-01', dateFrom: '2020-01-01', mocks })
      ).toThrow();
    });

    it("throws if 'dateTo' === 'dateFrom'", () => {
      return expect(
        () => new CalendarDay('date', { dateTo: '2020-01-01', dateFrom: '2020-01-01', mocks })
      ).toThrow();
    });

    it("throws if 'dateTo' is invalid", () => {
      return expect(
        () => new CalendarDay('date', { dateTo: '2000--1--1', dateFrom: '2020-01-01', mocks })
      ).toThrow();
    });

    it("throws if 'dateFrom' is invalid", () => {
      return expect(
        () => new CalendarDay('date', { dateFrom: '2000--1--1', dateTo: '2020-01-01', mocks })
      ).toThrow();
    });
  });
});
