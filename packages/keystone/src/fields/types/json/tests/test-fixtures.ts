import { json } from '..';
import { KeystoneContext } from '../../../../types';

export const name = 'Json';
export const typeFunction = json;
export const exampleValue = () => ({
  a: 3,
});
export const exampleValue2 = () => ({
  b: [],
});
export const supportsUnique = false;
export const fieldName = 'testField';

export const getTestFields = () => ({ testField: json() });

export const initItems = (_: any, context: KeystoneContext) => {
  return [
    { name: 'a', testField: { a: [] } },
    { name: 'b', testField: { b: 'string' } },
    { name: 'c', testField: { c: 42 } },
    { name: 'd', testField: { d: { i: 25 } } },
    { name: 'e', testField: { e: null } },
    { name: 'f', testField: context.prisma.DbNull },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', testField: { a: [] } },
  { name: 'b', testField: { b: 'string' } },
  { name: 'c', testField: { c: 42 } },
  { name: 'd', testField: { d: { i: 25 } } },
  { name: 'e', testField: { e: null } },
  { name: 'f', testField: null },
  { name: 'g', testField: null },
];

export const supportedFilters = () => [];
