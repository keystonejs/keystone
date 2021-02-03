import Select from './';
import Text from '../Text';

export const name = 'Select';
export const type = Select;
export const exampleValue = matrixValue =>
  matrixValue === 'enum' ? 'thinkmill' : matrixValue === 'string' ? 'a string' : 1;
export const exampleValue2 = matrixValue =>
  matrixValue === 'enum' ? 'atlassian' : matrixValue === 'string' ? '1number' : 2;
export const supportsUnique = true;
export const fieldConfig = matrixValue => ({
  dataType: matrixValue,
  options:
    matrixValue === 'enum'
      ? [
          { label: 'Thinkmill', value: 'thinkmill' },
          { label: 'Atlassian', value: 'atlassian' },
          { label: 'Thomas Walker Gelato', value: 'gelato' },
          { label: 'Cete, or Seat, or Attend ¯\\_(ツ)_/¯', value: 'cete' },
          { label: 'React', value: 'react' },
        ]
      : matrixValue === 'string'
      ? [
          { label: 'A string', value: 'a string' },
          { label: '1number', value: '1number' },
          { label: '@¯\\_(ツ)_/¯', value: '@¯\\_(ツ)_/¯' },
          { label: 'something else', value: 'something else' },
        ]
      : matrixValue === 'integer'
      ? [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
          { label: 'Three', value: 3 },
          { label: 'Four', value: 4 },
          { label: 'Five', value: 5 },
        ]
      : [],
});

export const fieldName = 'company';

export const supportedFilters = () => ['null_equality', 'equality', 'in_empty_null', 'in_equal'];

export const testMatrix = ['enum', 'string', 'integer'];

export const getTestFields = matrixValue => ({
  name: { type: Text },
  company: { type, ...fieldConfig(matrixValue) },
});

export const initItems = matrixValue => {
  if (matrixValue === 'enum') {
    return [
      { name: 'a', company: 'thinkmill' },
      { name: 'b', company: 'atlassian' },
      { name: 'c', company: 'gelato' },
      { name: 'd', company: 'cete' },
      { name: 'e', company: 'react' },
      { name: 'f', company: null },
      { name: 'g' },
    ];
  } else if (matrixValue === 'string') {
    return [
      { name: 'a', company: 'a string' },
      { name: 'b', company: '@¯\\_(ツ)_/¯' },
      { name: 'c', company: 'a string' },
      { name: 'd', company: '1number' },
      { name: 'e', company: 'something else' },
      { name: 'f', company: null },
      { name: 'g' },
    ];
  } else if (matrixValue === 'integer') {
    return [
      { name: 'a', company: 1 },
      { name: 'b', company: 2 },
      { name: 'c', company: 3 },
      { name: 'd', company: 4 },
      { name: 'e', company: 5 },
      { name: 'f', company: null },
      { name: 'g' },
    ];
  }
  return [];
};

export const storedValues = matrixValue => {
  if (matrixValue === 'enum') {
    return [
      { name: 'a', company: 'thinkmill' },
      { name: 'b', company: 'atlassian' },
      { name: 'c', company: 'gelato' },
      { name: 'd', company: 'cete' },
      { name: 'e', company: 'react' },
      { name: 'f', company: null },
      { name: 'g', company: null },
    ];
  } else if (matrixValue === 'string') {
    return [
      { name: 'a', company: 'a string' },
      { name: 'b', company: '@¯\\_(ツ)_/¯' },
      { name: 'c', company: 'a string' },
      { name: 'd', company: '1number' },
      { name: 'e', company: 'something else' },
      { name: 'f', company: null },
      { name: 'g', company: null },
    ];
  } else if (matrixValue === 'integer') {
    return [
      { name: 'a', company: 1 },
      { name: 'b', company: 2 },
      { name: 'c', company: 3 },
      { name: 'd', company: 4 },
      { name: 'e', company: 5 },
      { name: 'f', company: null },
      { name: 'g', company: null },
    ];
  }
};
