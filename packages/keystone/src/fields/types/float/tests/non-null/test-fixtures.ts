import { float } from '../..';

export const name = 'Float with isNullable: false';
export const typeFunction = (x: any) => float({ isNullable: false, ...x });
export const exampleValue = () => 6.28;
export const exampleValue2 = () => 6.283;
export const supportsUnique = true;
export const fieldName = 'testField';
export const skipRequiredTest = true;
export const supportsGraphQLIsNonNull = true;

export const getTestFields = () => ({
  testField: float({ isFilterable: true, isNullable: false }),
});

export const initItems = () => {
  return [
    { name: 'post1', testField: -21.5 },
    { name: 'post2', testField: 0 },
    { name: 'post3', testField: 1.2 },
    { name: 'post4', testField: 2.3 },
    { name: 'post5', testField: 3 },
    { name: 'post7' },
  ];
};

export const storedValues = () => [
  { name: 'post1', testField: -21.5 },
  { name: 'post2', testField: 0 },
  { name: 'post3', testField: 1.2 },
  { name: 'post4', testField: 2.3 },
  { name: 'post5', testField: 3 },
];

export const supportedFilters = () => [];
