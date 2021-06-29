import { bigInt } from '..';
import { text } from '../../text';

export const name = 'BigInt';
export const typeFunction = bigInt;
export const exampleValue = () => '9223372036854775807';
export const exampleValue2 = () => '-9223372036854775808';
export const supportsUnique = true;
export const fieldName = 'bigValue';

export const getTestFields = () => ({
  name: text(),
  bigValue: bigInt(),
});

export const initItems = () => {
  return [
    { name: 'value1', bigValue: '9223372036854775807' },
    { name: 'value2', bigValue: '-9223372036854775808' },
    { name: 'value3', bigValue: '-1' },
    { name: 'value4', bigValue: '0' },
    { name: 'value5', bigValue: '65536' },
    { name: 'value6', bigValue: null },
    { name: 'value7' },
  ];
};

export const storedValues = () => [
  { name: 'value1', bigValue: '9223372036854775807' },
  { name: 'value2', bigValue: '-9223372036854775808' },
  { name: 'value3', bigValue: '-1' },
  { name: 'value4', bigValue: '0' },
  { name: 'value5', bigValue: '65536' },
  { name: 'value6', price: null },
  { name: 'value7', price: null },
];

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'ordering',
  'in_empty_null',
  'in_equal',
  'unique_equality',
];
