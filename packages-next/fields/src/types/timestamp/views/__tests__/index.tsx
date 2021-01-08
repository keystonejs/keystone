import { constructTimestamp } from './index';
describe('constructTimestamp', () => {
    it('should throw on empty values', () => {
        expect(() => constructTimestamp({ dateValue: '', timeValue: '' })).toThrow();
        expect(() => constructTimestamp({ dateValue: '', timeValue: '09:30'})).toThrow();
        expect(() => constructTimestamp({ dateValue: new Date(), timeValue: ''})).toThrow();
    });
});