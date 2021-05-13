import { ProviderName } from '@keystone-next/test-utils-legacy';
import { text } from '..';

export const name = 'Text';
export const typeFunction = text;
export const exampleValue = () => 'foo';
export const exampleValue2 = () => 'bar';
export const supportsUnique = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ name: text(), testField: text() });

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

export const supportedFilters = (provider: ProviderName) => [
  'null_equality',
  'equality',
  provider !== 'sqlite' && 'equality_case_insensitive',
  'in_empty_null',
  'in_value',
  provider !== 'sqlite' && 'string',
  provider !== 'sqlite' && 'string_case_insensitive',
];
