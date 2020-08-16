import { getItems } from '@keystonejs/server-side-graphql-client';
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
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name enabled',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

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
      match(keystone, {}, [
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
      match(keystone, { enabled: true }, [
        { name: 'person1', enabled: true },
        { name: 'person4', enabled: true },
      ])
    )
  );

  test(
    'Filter: enabled false',
    withKeystone(({ keystone }) =>
      match(keystone, { enabled: false }, [{ name: 'person2', enabled: false }])
    )
  );

  test(
    'Filter: enabled_not true',
    withKeystone(({ keystone }) =>
      match(keystone, { enabled_not: true }, [
        { name: 'person2', enabled: false },
        { name: 'person3', enabled: null },
      ])
    )
  );

  test(
    'Filter: enabled_not false',
    withKeystone(({ keystone }) =>
      match(keystone, { enabled_not: false }, [
        { name: 'person1', enabled: true },
        { name: 'person3', enabled: null },
        { name: 'person4', enabled: true },
      ])
    )
  );
};
