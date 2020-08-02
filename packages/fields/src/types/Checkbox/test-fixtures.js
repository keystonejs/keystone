import { matchFilter } from '@keystonejs/test-utils';
import Text from '../Text';
import Checkbox from './';

export const name = 'Checkbox';
export { Checkbox as type };
export const exampleValue = 'true';
export const supportsUnique = false;

export const getTestFields = () => {
  return {
    name: { type: Text },
    enabled: { type: Checkbox },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', enabled: true },
    { name: 'person2', enabled: false },
    { name: 'person3', enabled: null },
    { name: 'person4', enabled: true },
  ];
};

export const filterTests = withKeystone => {
  const match = (keystone, queryArgs, expected) =>
    matchFilter({
      keystone,
      queryArgs,
      fieldSelection: 'name enabled',
      expected,
      sortKey: 'name',
    });

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { }', [
        { name: 'person1', enabled: true },
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Filter: enabled true',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { enabled: true }', [
        { name: 'person1', enabled: true },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Filter: enabled false',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { enabled: false }', [{ name: 'person2', enabled: false }])
    )
  );

  test(
    'Filter: enabled_not true',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { enabled_not: true }', [
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
      ])
    )
  );

  test(
    'Filter: enabled_not false',
    withKeystone(({ keystone }) =>
      match(keystone, 'where: { enabled_not: false }', [
        { name: 'person1', enabled: true },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );
};
