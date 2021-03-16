import Slug from './';
import Text from '../Text';

export const name = 'Slug';
export const type = Slug;
export const exampleValue = () => '"foo"';
export const exampleValue2 = () => '"bar"';
export const supportsUnique = null;
export const skipRequiredTest = true;
export const skipUpdateTest = true;
export const fieldName = 'testField';
export const getTestFields = () => ({
  name: { type: Text },
  testField: {
    type,
    isUnique: false,
    generate: ({ resolvedData, existingItem }) =>
      typeof { ...existingItem, ...resolvedData }.testField === 'string'
        ? { ...existingItem, ...resolvedData }.testField
        : 'null',
  },
});

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
  { name: 'f', testField: 'null' },
  { name: 'g', testField: 'null' },
];

export const supportedFilters = adapterName => [
  'equality',
  adapterName !== 'prisma_sqlite' && 'equality_case_insensitive',
  'in_value',
  adapterName !== 'prisma_sqlite' && 'string',
  adapterName !== 'prisma_sqlite' && 'string_case_insensitive',
];
