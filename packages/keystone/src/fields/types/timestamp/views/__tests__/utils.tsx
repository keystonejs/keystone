import { parseISO } from 'date-fns';
import { constructTimestamp } from '../utils';

const STUBVALIDDATE = '2020-10-31';
const STUBVALIDTIME = '10:00';

describe('constructTimestamp()', () => {
  it('should throw on empty values', () => {
    expect(() => constructTimestamp({ dateValue: '', timeValue: '' })).toThrow();
    expect(() => constructTimestamp({ dateValue: '', timeValue: '09:30' })).toThrow();
  });
  it('should take two valid timestamp values and construct them into a valid ISO string', () => {
    const result = constructTimestamp({ dateValue: STUBVALIDDATE, timeValue: STUBVALIDTIME });
    expect(Boolean(parseISO(result).toISOString())).toBe(true);
  });
});
