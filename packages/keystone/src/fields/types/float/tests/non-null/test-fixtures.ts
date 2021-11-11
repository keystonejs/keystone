import { float } from '../..';

export const name = 'Float with isNullable: false';
export const typeFunction = (x: any) => float({ ...x, db: { ...x?.db, isNullable: false } });
export const exampleValue = () => 6.28;
export const exampleValue2 = () => 6.283;
export const supportsUnique = true;
export const fieldName = 'testField';
export const supportsGraphQLIsNonNull = true;
export const supportsDbMap = true;

export const getTestFields = () => ({ testField: float({ db: { isNullable: false } }) });

export const initItems = () => {
  return [
    { name: 'post1', testField: -21.5 },
    { name: 'post2', testField: 0 },
    { name: 'post3', testField: 1.2 },
    { name: 'post4', testField: 2.3 },
    { name: 'post5', testField: 3 },
    { name: 'post6', testField: 5 },
    { name: 'post7', testField: 20.8 },
  ];
};

export const storedValues = () => [
  { name: 'post1', testField: -21.5 },
  { name: 'post2', testField: 0 },
  { name: 'post3', testField: 1.2 },
  { name: 'post4', testField: 2.3 },
  { name: 'post5', testField: 3 },
  { name: 'post6', testField: 5 },
  { name: 'post7', testField: 20.8 },
];

export const supportedFilters = () => [];
