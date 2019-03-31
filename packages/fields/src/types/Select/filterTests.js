import { matchFilter } from '@keystone-alpha/test-utils';
import Select from './';
import Text from '../Text';

export const name = 'Select';

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
  const match = (server, filter, targets) =>
    matchFilter(
      server,
      filter,
      '{ company name }',
      targets,
      'name' // Sort by name
    );

  test(
    'No filter',
    withKeystone(({ server: { server } }) =>
      match(server, undefined, [
        { company: 'thinkmill', name: 'a' },
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
        { company: 'cete', name: 'd' },
      ])
    )
  );

  test(
    'Filter: company',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { company: thinkmill }', [{ company: 'thinkmill', name: 'a' }])
    )
  );

  test(
    'Filter: company_not',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { company_not: thinkmill }', [
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
        { company: 'cete', name: 'd' },
      ])
    )
  );

  test(
    'Filter: company_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { company_in: [ atlassian, gelato ] }', [
        { company: 'atlassian', name: 'b' },
        { company: 'gelato', name: 'c' },
      ])
    )
  );

  test(
    'Filter: company_not_in',
    withKeystone(({ server: { server } }) =>
      match(server, 'where: { company_not_in: [ atlassian, gelato ] }', [
        { company: 'thinkmill', name: 'a' },
        { company: 'cete', name: 'd' },
      ])
    )
  );
};
