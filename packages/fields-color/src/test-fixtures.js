import { Text } from '@keystonejs/fields';
import { Color } from '.';

export const name = 'Color';
export const type = Color;
export const exampleValue = () => 'red';
export const exampleValue2 = () => 'green';
export const supportsUnique = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ name: { type: Text }, testField: { type } });

export const initItems = () => {
  return [
    { name: 'a', testField: '' },
    { name: 'b', testField: 'other' },
    { name: 'c', testField: 'FOOBAR' },
    { name: 'd', testField: 'fooBAR' },
    { name: 'e', testField: 'foobar' },
    { name: 'f', testField: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', testField: '' },
  { name: 'b', testField: 'other' },
  { name: 'c', testField: 'FOOBAR' },
  { name: 'd', testField: 'fooBAR' },
  { name: 'e', testField: 'foobar' },
  { name: 'f', testField: null },
  { name: 'g', testField: null },
];

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'equality_case_insensitive',
  'in_empty_null',
  'in_value',
  'string',
  'string_case_insensitive',
];
