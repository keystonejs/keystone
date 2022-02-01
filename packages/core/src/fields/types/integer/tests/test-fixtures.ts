import { integer } from '..';

export const name = 'Integer';
export const typeFunction = integer;
export const exampleValue = () => 37;
export const exampleValue2 = () => 38;
export const supportsNullInput = true;
export const supportsUnique = true;
export const supportsDbMap = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ testField: integer() });

export const initItems = () => {
  return [
    { name: 'person1', testField: 0 },
    { name: 'person2', testField: 1 },
    { name: 'person3', testField: 2 },
    { name: 'person4', testField: 3 },
    { name: 'person5', testField: 37 },
    { name: 'person6', testField: null },
    { name: 'person7' },
  ];
};

export const storedValues = () => [
  { name: 'person1', testField: 0 },
  { name: 'person2', testField: 1 },
  { name: 'person3', testField: 2 },
  { name: 'person4', testField: 3 },
  { name: 'person5', testField: 37 },
  { name: 'person6', testField: null },
  { name: 'person7', testField: null },
];

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'ordering',
  'in_empty_null',
  'in_equal',
  'unique_equality',
];
