import { checkbox } from '..';

export const name = 'Checkbox';
export const typeFunction = checkbox;
export const exampleValue = () => true;
export const exampleValue2 = () => false;
export const supportsUnique = false;
export const fieldName = 'enabled';
export const skipRequiredTest = true;
export const supportsGraphQLIsNonNull = true;

export const getTestFields = () => ({
  enabled: checkbox({ isFilterable: true }),
});

export const initItems = () => {
  return [
    { name: 'person1', enabled: false },
    { name: 'person2', enabled: false },
    { name: 'person3', enabled: false },
    { name: 'person4', enabled: true },
    { name: 'person5', enabled: false },
    { name: 'person6', enabled: false },
    { name: 'person7', enabled: false },
  ];
};

export const storedValues = () => [
  { name: 'person1', enabled: false },
  { name: 'person2', enabled: false },
  { name: 'person3', enabled: false },
  { name: 'person4', enabled: true },
  { name: 'person5', enabled: false },
  { name: 'person6', enabled: false },
  { name: 'person7', enabled: false },
];

export const supportedFilters = () => ['equality'];
