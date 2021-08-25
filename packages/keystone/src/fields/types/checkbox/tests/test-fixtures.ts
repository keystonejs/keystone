import { checkbox } from '..';

export const name = 'Checkbox';
export const typeFunction = checkbox;
export const exampleValue = () => true;
export const exampleValue2 = () => false;
export const supportsUnique = false;
export const fieldName = 'enabled';

export const getTestFields = () => ({
  enabled: checkbox({ graphql: { isEnabled: { filter: true } } }),
});

export const initItems = () => {
  return [
    { name: 'person1', enabled: false },
    { name: 'person2', enabled: false },
    { name: 'person3', enabled: false },
    { name: 'person4', enabled: true },
    { name: 'person5', enabled: false },
    { name: 'person6', enabled: null },
    { name: 'person7', enabled: null },
  ];
};

export const storedValues = () => [
  { name: 'person1', enabled: false },
  { name: 'person2', enabled: false },
  { name: 'person3', enabled: false },
  { name: 'person4', enabled: true },
  { name: 'person5', enabled: false },
  { name: 'person6', enabled: null },
  { name: 'person7', enabled: null },
];

export const supportedFilters = () => ['null_equality', 'equality'];
