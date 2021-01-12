import { controller } from '../index';
import { formatISO } from 'date-fns';
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
});
