import { parseISO } from 'date-fns';
import { constructTimestamp, isValidISO } from '../utils';

describe('./utils.ts', () => {
    describe('constructTimestamp()', () => {
        it('should throw on empty values', () => {
            expect(() => constructTimestamp({ dateValue: '', timeValue: '' })).toThrow();
            expect(() => constructTimestamp({ dateValue: '', timeValue: '09:30' })).toThrow();
        });
        it('should take two valid timestamp values and construct them into a valid ISO string', () => {
            const result = constructTimestamp({ dateValue: new Date(), timeValue: '10:00' });
            expect(Boolean(parseISO(result).toISOString())).toBe(true);
        });
    });
    describe('isValidISO()', () => {
        it('should return false if two empty string values are provided', () => {
            expect(isValidISO({ dateValue: '', timeValue: '' })).toBe(false);
        });
        it('should return false if no date value is provided' , () => {
            expect(isValidISO({ dateValue: '', timeValue: '10:00' })).toBe(false);
        });
        it('should return true if no date value is provided, but a time value is not provided', () => {
            expect(isValidISO({ dateValue: new Date(), timeValue: '' })).toBe(true);
        });
        it('should return false if a time value is invalid', () => {
            expect(isValidISO({ dateValue: new Date(), timeValue: 'not a real time' })).toBe(false);
        });
        it('should return false if a date value is invalid', () => {
            expect(isValidISO({ dateValue: 'not a valid date value', timeValue: '10:00'})).toBe(false);
        });
        it('should return false if both date value and time value is invalid', () => {
            expect(isValidISO({ dateValue: 'not a valid date value', timeValue: 'not a valid time value'})).toBe(false);
        });
        it('should return true if both date value and time value are valid', () => {
            expect(isValidISO({ dateValue: new Date() , timeValue: '00:00' })).toBe(true);
        });
        it('should return false on 12 hr time input', () => {
            expect(isValidISO({ dateValue: new Date(), timeValue: '10:00 am'})).toBe(false);
        });
    });
});