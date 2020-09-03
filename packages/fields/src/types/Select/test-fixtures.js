import { getItems } from '@keystonejs/server-side-graphql-client';
import Select from './';
import Text from '../Text';

export const name = 'Select';

export { Select as type };
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

export const testMatrix = ['enum', 'string', 'integer'];

export const getTestFields = matrixValue => {
  return {
    name: { type: Text },
    company: { type: Select, ...fieldConfig(matrixValue) },
  };
};

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

export const filterTests = (withKeystone, matrixValue) => {
  const match = async (keystone, where, expected, returnFields = 'name company') =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields,
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    `No filter (dataType: ${matrixValue})`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        undefined,
        matrixValue === 'enum'
          ? [
              { name: 'a', company: 'thinkmill' },
              { name: 'b', company: 'atlassian' },
              { name: 'c', company: 'gelato' },
              { name: 'd', company: 'cete' },
              { name: 'e', company: 'react' },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
          : matrixValue === 'string'
          ? [
              { name: 'a', company: 'a string' },
              { name: 'b', company: '@¯\\_(ツ)_/¯' },
              { name: 'c', company: 'a string' },
              { name: 'd', company: '1number' },
              { name: 'e', company: 'something else' },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
          : [
              { name: 'a', company: 1 },
              { name: 'b', company: 2 },
              { name: 'c', company: 3 },
              { name: 'd', company: 4 },
              { name: 'e', company: 5 },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
      )
    )
  );

  test(
    `Filter: company (dataType: ${matrixValue})`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        matrixValue === 'enum'
          ? { company: 'thinkmill' }
          : matrixValue === 'string'
          ? { company: 'a string' }
          : { company: 1 },
        matrixValue === 'enum'
          ? [{ company: 'thinkmill', name: 'a' }]
          : matrixValue === 'string'
          ? [
              { name: 'a', company: 'a string' },
              { name: 'c', company: 'a string' },
            ]
          : [{ name: 'a', company: 1 }]
      )
    )
  );

  test(
    `Filter: company_not (dataType: ${matrixValue})`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        matrixValue === 'enum'
          ? { company_not: 'thinkmill' }
          : matrixValue === 'string'
          ? { company_not: 'a string' }
          : { company_not: 1 },
        matrixValue === 'enum'
          ? [
              { company: 'atlassian', name: 'b' },
              { company: 'gelato', name: 'c' },
              { company: 'cete', name: 'd' },
              { name: 'e', company: 'react' },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
          : matrixValue === 'string'
          ? [
              { name: 'b', company: '@¯\\_(ツ)_/¯' },
              { name: 'd', company: '1number' },
              { name: 'e', company: 'something else' },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
          : [
              { name: 'b', company: 2 },
              { name: 'c', company: 3 },
              { name: 'd', company: 4 },
              { name: 'e', company: 5 },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
      )
    )
  );

  test(
    `Filter: company_in (dataType: ${matrixValue})`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        matrixValue === 'enum'
          ? { company_in: ['atlassian', 'gelato'] }
          : matrixValue === 'string'
          ? { company_in: [`@¯\\_(ツ)_/¯`, '1number'] }
          : { company_in: [2, 3] },
        matrixValue === 'enum'
          ? [
              { company: 'atlassian', name: 'b' },
              { company: 'gelato', name: 'c' },
            ]
          : matrixValue === 'string'
          ? [
              { name: 'b', company: `@¯\\_(ツ)_/¯` },
              { name: 'd', company: '1number' },
            ]
          : [
              { name: 'b', company: 2 },
              { name: 'c', company: 3 },
            ]
      )
    )
  );

  test(
    `Filter: company_not_in (dataType: ${matrixValue})`,
    withKeystone(({ keystone }) =>
      match(
        keystone,
        matrixValue === 'enum'
          ? { company_not_in: ['atlassian', 'gelato'] }
          : matrixValue === 'string'
          ? { company_not_in: [`@¯\\_(ツ)_/¯`, '1number'] }
          : { company_not_in: [2, 3] },
        matrixValue === 'enum'
          ? [
              { name: 'a', company: 'thinkmill' },
              { name: 'd', company: 'cete' },
              { name: 'e', company: 'react' },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
          : matrixValue === 'string'
          ? [
              { name: 'a', company: 'a string' },
              { name: 'c', company: 'a string' },
              { name: 'e', company: 'something else' },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
          : [
              { name: 'a', company: 1 },
              { name: 'd', company: 4 },
              { name: 'e', company: 5 },
              { name: 'f', company: null },
              { name: 'g', company: null },
            ]
      )
    )
  );
};
