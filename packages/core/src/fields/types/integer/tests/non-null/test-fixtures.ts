import { integer } from '../..';

export const name = 'Integer with isNullable: false';
export const typeFunction = (x: any) => integer({ ...x, db: { ...x?.db, isNullable: false } });
export const exampleValue = () => 37;
export const exampleValue2 = () => 38;
export const supportsGraphQLIsNonNull = true;
export const supportsDbMap = true;
export const supportsUnique = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ testField: integer({ db: { isNullable: false } }) });

export const initItems = () => {
  return [
    { name: 'person1', testField: 0 },
    { name: 'person2', testField: 1 },
    { name: 'person3', testField: 2 },
    { name: 'person4', testField: 3 },
    { name: 'person5', testField: 37 },
    { name: 'person6', testField: 10 },
    { name: 'person7', testField: 20 },
  ];
};

export const storedValues = () => [
  { name: 'person1', testField: 0 },
  { name: 'person2', testField: 1 },
  { name: 'person3', testField: 2 },
  { name: 'person4', testField: 3 },
  { name: 'person5', testField: 37 },
  { name: 'person6', testField: 10 },
  { name: 'person7', testField: 20 },
];

export const supportedFilters = () => [];
