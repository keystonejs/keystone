import Text from '../Text';
import Float from '.';

export const name = 'Float';
export const type = Float;
export const exampleValue = () => 6.28;
export const exampleValue2 = () => 6.283;
export const supportsUnique = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ name: { type: Text }, testField: { type } });

export const initItems = () => {
  return [
    { name: 'post1', testField: -21.5 },
    { name: 'post2', testField: 0 },
    { name: 'post3', testField: 1.2 },
    { name: 'post4', testField: 2.3 },
    { name: 'post5', testField: 3 },
    { name: 'post6', testField: null },
    { name: 'post7' },
  ];
};

export const storedValues = () => [
  { name: 'post1', testField: -21.5 },
  { name: 'post2', testField: 0 },
  { name: 'post3', testField: 1.2 },
  { name: 'post4', testField: 2.3 },
  { name: 'post5', testField: 3 },
  { name: 'post6', testField: null },
  { name: 'post7', testField: null },
];

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'ordering',
  'in_empty_null',
  'in_equal',
];
