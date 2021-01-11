import { controller } from '../index';
describe('./index.tsx', () => {
  describe('controller', () => {
    describe('validate', () => {
      it('should return true if neither date nor time value are specified', () => {
        const { validate } = controller({});
        expect(validate({ dateValue: '', timeValue: '' })).toBe(true);
      });
      it('should return true if both date and time values are valid', () => {
        const { validate } = controller({});
        expect(validate({ dateValue: new Date(), timeValue: '10:00' })).toBe(true);
      });
      it('should return false if only the date value is missing', () => {
        const { validate } = controller({});
        expect(validate({ dateValue: '', timeValue: '10:00' })).toBe(false);
      });
    });
  });
});
