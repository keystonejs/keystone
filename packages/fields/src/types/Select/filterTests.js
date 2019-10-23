import { matchFilter } from '@keystone/test-utils';
import Select from './';
import Text from '../Text';

export const name = 'Select';

export { Select as type };
export const exampleValue = 'thinkmill';

export const getTestFields = () => {
  return {
    name: { type: Text }, // Provide a field to sort on
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
        { label: 'Thomas Walker Gelato', value: 'gelato' },
        { label: 'Cete, or Seat, or Attend ¯\\_(ツ)_/¯', value: 'cete' },
      ],
    },
  };
};

export const initItems = () => {
  return [
    { company: 'thinkmill', name: 'a' },
    { company: 'atlassian', name: 'b' },
    { company: 'gelato', name: 'c' },
    { company: 'cete', name: 'd' },
  ];
};

export const filterTests = withKeystone => {
  const match = (keystone, filter, targets) =>
    matchFilter(
      keystone,
      filter,
      '{ company name }',
      targets,
      'name' // Sort by name
    );

  test(
    'No filter',
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
    'Filter: company',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company: thinkmill }', [{ company: 'thinkmill', name: 'a' }])
    )
  );

  test(
    'Filter: company_not',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company_not: thinkmill }', [
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
        { company: 'cete', name: 'd' },
      ])
    )
  );

  test(
    'Filter: company_in',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company_in: [ atlassian, gelato ] }', [
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
      ])
    )
  );

  test(
    'Filter: company_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { company_not_in: [ atlassian, gelato ] }', [
        { company: 'thinkmill', name: 'a' },
        { company: 'cete', name: 'd' },
      ])
    )
  );
};
