import { formatISO } from 'date-fns';
import { FieldControllerConfig } from '../../../../../types';
import { controller, TimestampFieldMeta } from '../index';
const STUBCONFIG: FieldControllerConfig<TimestampFieldMeta> = {
  listKey: 'timestamp',
  path: './timestamp',
  label: 'timestmap',
  customViews: {},
  fieldMeta: { defaultValue: null, isRequired: false, updatedAt: false },
};

describe('controller', () => {
  describe('validate', () => {
    it('should return true if neither date nor time value are specified', () => {
      const { validate } = controller(STUBCONFIG);
      expect(
        validate!({
          kind: 'create',
          value: { dateValue: null, timeValue: { kind: 'parsed', value: null } },
        })
      ).toBe(true);
    });
    it('should return true if both date and time values are valid', () => {
      const { validate } = controller(STUBCONFIG);
      const value = {
        kind: 'create',
        value: {
          dateValue: formatISO(new Date(), { representation: 'date' }),
          timeValue: {
            kind: 'parsed',
            value: '10:00:00.000',
          },
        },
      } as const;
      expect(validate!(value)).toBe(true);
    });
    it('should return false if only the date value is missing', () => {
      const { validate } = controller(STUBCONFIG);
      expect(
        validate!({
          kind: 'create',
          value: {
            dateValue: null,
            timeValue: {
              kind: 'parsed',
              value: '10:00:00.000',
            },
          },
        })
      ).toBe(false);
    });
    it('should return false if only the time value is missing', () => {
      const { validate } = controller(STUBCONFIG);
      expect(
        validate!({
          kind: 'create',
          value: {
            dateValue: formatISO(new Date(), { representation: 'date' }),
            timeValue: { kind: 'parsed', value: null },
          },
        })
      ).toBe(false);
    });
  });
  describe('serialize', () => {
    it('should return null if neither date nor time value is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(
        serialize({
          kind: 'create',
          value: {
            dateValue: null,
            timeValue: { kind: 'parsed', value: null },
          },
        })
      ).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return null if an invalid time value is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(
        serialize({
          kind: 'create',
          value: {
            dateValue: '2020-10-20',
            timeValue: 'hello',
          },
        })
      ).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return null if no dateValue is specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(
        serialize({
          kind: 'create',
          value: {
            dateValue: null,
            timeValue: { kind: 'parsed', value: '10:00:00.000' },
          },
        })
      ).toStrictEqual({
        [STUBCONFIG.path]: null,
      });
    });
    it('should return a valid ISO8601 string if a valid time and date value are specified', () => {
      const { serialize } = controller(STUBCONFIG);
      expect(
        serialize({
          kind: 'create',
          value: { dateValue: '2020-10-20', timeValue: { kind: 'parsed', value: '10:00:00.000' } },
        })[STUBCONFIG.path]
      ).toEqual(new Date('2020-10-20T10:00:00.000').toISOString());
    });
  });
});
