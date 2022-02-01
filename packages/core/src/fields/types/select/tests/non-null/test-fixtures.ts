import { select } from '../..';
import { fieldConfig } from '../test-fixtures';

export {
  exampleValue,
  exampleValue2,
  supportsUnique,
  fieldConfig,
  fieldName,
} from '../test-fixtures';

type MatrixValue = typeof testMatrix[number];

export const name = 'Select with isNullable: false';
export const typeFunction = (config: any) =>
  select({ ...config, db: { ...config?.db, isNullable: false } });
export const supportsDbMap = true;

export const supportedFilters = () => [];

export const testMatrix = ['enum', 'string', 'integer'] as const;

export const getTestFields = (matrixValue: MatrixValue) => ({
  company: typeFunction(fieldConfig(matrixValue)),
});

export const initItems = (matrixValue: MatrixValue) => {
  if (matrixValue === 'enum') {
    return [
      { name: 'a', company: 'thinkmill' },
      { name: 'b', company: 'atlassian' },
      { name: 'c', company: 'gelato' },
      { name: 'd', company: 'cete' },
      { name: 'e', company: 'react' },
      { name: 'f', company: 'react' },
      { name: 'g', company: 'react' },
    ];
  } else if (matrixValue === 'string') {
    return [
      { name: 'a', company: 'a string' },
      { name: 'b', company: '@¯\\_(ツ)_/¯' },
      { name: 'c', company: 'a string' },
      { name: 'd', company: '1number' },
      { name: 'e', company: 'something else' },
      { name: 'f', company: 'something else' },
      { name: 'g', company: 'something else' },
    ];
  } else if (matrixValue === 'integer') {
    return [
      { name: 'a', company: 1 },
      { name: 'b', company: 2 },
      { name: 'c', company: 3 },
      { name: 'd', company: 4 },
      { name: 'e', company: 5 },
      { name: 'f', company: 5 },
      { name: 'g', company: 5 },
    ];
  }
  return [];
};

export const storedValues = (matrixValue: MatrixValue) => {
  if (matrixValue === 'enum') {
    return [
      { name: 'a', company: 'thinkmill' },
      { name: 'b', company: 'atlassian' },
      { name: 'c', company: 'gelato' },
      { name: 'd', company: 'cete' },
      { name: 'e', company: 'react' },
      { name: 'f', company: 'react' },
      { name: 'g', company: 'react' },
    ];
  } else if (matrixValue === 'string') {
    return [
      { name: 'a', company: 'a string' },
      { name: 'b', company: '@¯\\_(ツ)_/¯' },
      { name: 'c', company: 'a string' },
      { name: 'd', company: '1number' },
      { name: 'e', company: 'something else' },
      { name: 'f', company: 'something else' },
      { name: 'g', company: 'something else' },
    ];
  } else if (matrixValue === 'integer') {
    return [
      { name: 'a', company: 1 },
      { name: 'b', company: 2 },
      { name: 'c', company: 3 },
      { name: 'd', company: 4 },
      { name: 'e', company: 5 },
      { name: 'f', company: 5 },
      { name: 'g', company: 5 },
    ];
  }
};
