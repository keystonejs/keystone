import { matchFilter } from '@keystonejs/test-utils';
import Select from './';
import Text from '../Text';

export const name = 'Select';

export { Select as type };
export const exampleValue = 'thinkmill';
export const exampleValue2 = 'atlassian';
export const supportsUnique = true;
export const fieldConfig = {
  options: [
    { label: 'Thinkmill', value: 'thinkmill' },
    { label: 'Atlassian', value: 'atlassian' },
  ],
};

export const getTestFields = () => {
  return {
    name: { type: Text }, // Provide a field to sort on
    company: {
      type: Select,
      dataType: 'enum',
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
        { label: 'Thomas Walker Gelato', value: 'gelato' },
        { label: 'Cete, or Seat, or Attend ¯\\_(ツ)_/¯', value: 'cete' },
      ],
    },
    selectString: {
      type: Select,
      dataType: 'string',
      options: [
        { label: 'A string', value: 'a string' },
        { label: '1number', value: '1number' },
        { label: '@¯\\_(ツ)_/¯', value: '@¯\\_(ツ)_/¯' },
      ],
    },
    selectNumber: {
      type: Select,
      dataType: 'integer',
      options: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 },
      ],
    },
  };
};

export const initItems = () => {
  return [
    { company: 'thinkmill', name: 'a', selectString: 'a string', selectNumber: 1 },
    { company: 'atlassian', name: 'b', selectString: '@¯\\_(ツ)_/¯', selectNumber: 2 },
    { company: 'gelato', name: 'c', selectString: 'a string', selectNumber: 3 },
    { company: 'cete', name: 'd', selectString: '1number', selectNumber: 1 },
  ];
};

export const filterTests = withKeystone => {
  const match = (keystone, queryArgs, expected, fieldSelection = 'name company') =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection,
      expected,
      sortKey: 'name',
    });

  test(
    'No filter (dataType: enum)',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { company: 'thinkmill', name: 'a' },
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
        { company: 'cete', name: 'd' },
      ])
    )
  );

  test(
    'No filter (dataType: string)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        undefined,
        [
          { name: 'a', selectString: 'a string' },
          { name: 'b', selectString: '@¯\\_(ツ)_/¯' },
          { name: 'c', selectString: 'a string' },
          { name: 'd', selectString: '1number' },
        ],
        'name selectString'
      )
    )
  );

  test(
    'No filter (dataType: number)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        undefined,
        [
          { name: 'a', selectNumber: 1 },
          { name: 'b', selectNumber: 2 },
          { name: 'c', selectNumber: 3 },
          { name: 'd', selectNumber: 1 },
        ],
        'name selectNumber'
      )
    )
  );

  test(
    'Filter: company (dataType: enum)',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company: thinkmill }', [{ company: 'thinkmill', name: 'a' }])
    )
  );

  test(
    'Filter: selectString (dataType: string)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { selectString: "a string" }',
        [
          { selectString: 'a string', name: 'a' },
          { selectString: 'a string', name: 'c' },
        ],
        'name selectString'
      )
    )
  );

  test(
    'Filter: selectNumber (dataType: number))',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { selectNumber: 1 }',
        [
          { name: 'a', selectNumber: 1 },
          { name: 'd', selectNumber: 1 },
        ],
        'name selectNumber'
      )
    )
  );

  test(
    'Filter: company_not (dataType: enum)',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company_not: thinkmill }', [
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
        { company: 'cete', name: 'd' },
      ])
    )
  );

  test(
    'Filter: selectString_not (dataType: string)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { selectString_not: "a string" }',
        [
          { name: 'b', selectString: '@¯\\_(ツ)_/¯' },
          { name: 'd', selectString: '1number' },
        ],
        'name selectString'
      )
    )
  );

  test(
    'Filter: selectNumber_not (dataType: number)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        'where: { selectNumber_not: 1 }',
        [
          { name: 'b', selectNumber: 2 },
          { name: 'c', selectNumber: 3 },
        ],
        'name selectNumber'
      )
    )
  );

  test(
    'Filter: company_in (dataType: enum)',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company_in: [ atlassian, gelato ] }', [
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
      ])
    )
  );

  test(
    'Filter: selectString_in (dataType: string)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        `where: { selectString_in: [ ${JSON.stringify(`@¯\\_(ツ)_/¯`)}, "1number" ] }`,
        [
          { name: 'b', selectString: `@¯\\_(ツ)_/¯` },
          { name: 'd', selectString: '1number' },
        ],
        'name selectString'
      )
    )
  );

  test(
    'Filter: selectNumber_in (dataType: number)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        `where: { selectNumber_in: [ 2, 3] }`,
        [
          { name: 'b', selectNumber: 2 },
          { name: 'c', selectNumber: 3 },
        ],
        'name selectNumber'
      )
    )
  );

  test(
    'Filter: company_not_in (dataType: enum)',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company_not_in: [ atlassian, gelato ] }', [
        { company: 'thinkmill', name: 'a' },
        { company: 'cete', name: 'd' },
      ])
    )
  );

  test(
    'Filter: selectString_not_in (dataType: string)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        `where: { selectString_not_in: [ ${JSON.stringify(`@¯\\_(ツ)_/¯`)}, "1number" ] }`,
        [
          { selectString: 'a string', name: 'a' },
          { selectString: 'a string', name: 'c' },
        ],
        'name selectString'
      )
    )
  );

  test(
    'Filter: selectNumber_not_in (dataType: number)',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        `where: { selectNumber_not_in: [ 2, 3 ] }`,
        [
          { name: 'a', selectNumber: 1 },
          { name: 'd', selectNumber: 1 },
        ],
        'name selectNumber'
      )
    )
  );
};
