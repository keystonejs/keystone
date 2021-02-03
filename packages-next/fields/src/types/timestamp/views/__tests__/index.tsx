import { controller } from '../index';
import { formatISO, parseISO } from 'date-fns';
const STUBCONFIG = {
  listKey: 'timestamp',
  path: './timestamp',
  label: 'timestmap',
  customViews: {},
  fieldMeta: undefined,
};

describe('controller', () => {
  describe('validate', () => {
    it('should return true if neither date nor time value are specified', () => {
      const { validate } = controller(STUBCONFIG);
      expect(validate!({ dateValue: '', timeValue: '' })).toBe(true);
    });
    it('should return true if both date and time values are valid', () => {
      const { validate } = controller(STUBCONFIG);
      const value = {
        dateValue: formatISO(new Date(), { representation: 'date' }),
        timeValue: '10:00',
      } as const;
      expect(validate!(value)).toBe(true);
    });
    it('should return false if only the date value is missing', () => {
      const { validate } = controller(STUBCONFIG);
      expect(validate!({ dateValue: '', timeValue: '10:00' })).toBe(false);
    });
    it('should return false if only the time value is missing', () => {
      const { validate } = controller(STUBCONFIG);
      expect(
        validate!({
          dateValue: formatISO(new Date(), { representation: 'date' }),
          timeValue: '',
        })
      ).toBe(false);
    });
  });
  describe('serialize', () => {
    it('should return null if neither date nor time value is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(serialize({ dateValue: '', timeValue: '' })).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return null if an invalid date value is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(serialize({ dateValue: 'aasdfasdf', timeValue: '10:00' })).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return null if an invalid time value is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(serialize({ dateValue: '2020-10-20', timeValue: 'hello' })).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return null if no dateValue is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(serialize({ dateValue: '', timeValue: '10:00' })).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return null if no timeValue is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(serialize({ dateValue: '2020-10-20', timeValue: '' })).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return a valid ISO8601 string if a valid time and date value are specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(
        Boolean(
          parseISO(
            serialize({ dateValue: '2020-10-20', timeValue: '10:00' })[STUBCONFIG.path]
          ).toISOString()
        )
      ).toBe(true);
    });
  });
});
