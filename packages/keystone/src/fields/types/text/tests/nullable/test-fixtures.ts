import { DatabaseProvider } from '../../../../../types';
import { text } from '../..';

export const name = 'Text with isNullable: true';
export const typeFunction = (config: any) =>
  text({ ...config, db: { ...config?.db, isNullable: true } });
export const exampleValue = () => 'foo';
export const exampleValue2 = () => 'bar';
export const supportsNullInput = true;
export const supportsUnique = true;
export const supportsDbMap = true;
export const fieldName = 'testField';

export const getTestFields = () => ({ testField: text({ db: { isNullable: true } }) });

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

export const supportedFilters = (provider: DatabaseProvider) => [
  'null_equality',
  'equality',
  provider !== 'sqlite' && 'equality_case_insensitive',
  'in_empty_null',
  'in_value',
  provider !== 'sqlite' && 'string',
  provider !== 'sqlite' && 'string_case_insensitive',
  'unique_equality',
];
