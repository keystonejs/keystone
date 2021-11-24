import { select } from '..';

type MatrixValue = typeof testMatrix[number];

export const name = 'Select';
export const typeFunction = select;
export const exampleValue = (matrixValue: MatrixValue) =>
  matrixValue === 'enum' ? 'thinkmill' : matrixValue === 'string' ? 'a string' : 1;
export const exampleValue2 = (matrixValue: MatrixValue) =>
  matrixValue === 'enum' ? 'atlassian' : matrixValue === 'string' ? '1number' : 2;
export const supportsNullInput = true;
export const supportsUnique = true;
export const supportsDbMap = true;
export const fieldConfig = (matrixValue: MatrixValue) => {
  if (matrixValue === 'enum' || matrixValue === 'string') {
    return {
      type: matrixValue,
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
              { label: 'Another string', value: 'another string' },
              { label: '1number', value: '1number' },
              { label: '@¯\\_(ツ)_/¯', value: '@¯\\_(ツ)_/¯' },
              { label: 'something else', value: 'something else' },
            ]
          : [],
    };
  }
  return {
    type: matrixValue,
    options: [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
      { label: 'Three', value: 3 },
      { label: 'Four', value: 4 },
      { label: 'Five', value: 5 },
    ],
  };
};
export const fieldName = 'company';

export const supportedFilters = () => [
  'null_equality',
  'equality',
  'in_empty_null',
  'in_equal',
  'unique_equality',
];

export const testMatrix = ['enum', 'string', 'integer'] as const;

export const getTestFields = (matrixValue: MatrixValue) => ({
  company: select(fieldConfig(matrixValue)),
});

export const initItems = (matrixValue: MatrixValue) => {
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
      { name: 'c', company: 'another string' },
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

export const storedValues = (matrixValue: MatrixValue) => {
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
      { name: 'c', company: 'another string' },
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
