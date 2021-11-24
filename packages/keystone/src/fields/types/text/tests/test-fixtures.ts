import { text } from '..';

export const name = 'Text';
export const typeFunction = text;
export const exampleValue = () => 'foo';
export const exampleValue2 = () => 'bar';
export const supportsNullInput = false;
export const supportsUnique = true;
export const supportsGraphQLIsNonNull = true;
export const supportsDbMap = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ testField: text() });

export const initItems = () => {
  return [
    { name: 'a', testField: '' },
    { name: 'b', testField: 'other' },
    { name: 'c', testField: 'FOOBAR' },
    { name: 'd', testField: 'fooBAR' },
    { name: 'e', testField: 'foobar' },
    { name: 'f' },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', testField: '' },
  { name: 'b', testField: 'other' },
  { name: 'c', testField: 'FOOBAR' },
  { name: 'd', testField: 'fooBAR' },
  { name: 'e', testField: 'foobar' },
  { name: 'f', testField: '' },
  { name: 'g', testField: '' },
];

export const supportedFilters = () => [];
