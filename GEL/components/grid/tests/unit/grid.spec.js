import { stringVal, repeatNumeric, formatAreas } from '../../src/Grid';

test('Testing stringVal for correct output', () => {
	expect(stringVal(5)).toBe('5px');
	expect(stringVal('5px')).toBe('5px');
	expect(stringVal('5vw')).toBe('5vw');
	expect(stringVal('0')).toBe('0');
});

test('Testing repeatNumeric for correct output', () => {
	expect(repeatNumeric(5)).toBe('repeat(5, 1fr)');
	expect(repeatNumeric('5px')).toBe('5px');
	expect(repeatNumeric('5vw')).toBe('5vw');
	expect(repeatNumeric('0')).toBe('0');
});

test('Testing formatAreas for correct output', () => {
	expect(formatAreas([5, 5])).toBe('"5" "5"');
	expect(formatAreas(['top', 'bottom', 'aside', 'Joss'])).toBe('"top" "bottom" "aside" "Joss"');
	expect(formatAreas([null])).toBe('"null"');
});
