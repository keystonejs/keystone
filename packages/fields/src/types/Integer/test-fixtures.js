import { getItems } from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import Integer from './';

export const name = 'Integer';
export { Integer as type };
export const exampleValue = 37;
export const exampleValue2 = 38;
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    name: { type: Text },
    count: { type: Integer },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', count: 0 },
    { name: 'person2', count: 1 },
    { name: 'person3', count: 2 },
    { name: 'person4', count: 3 },
    { name: 'person5', count: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name count',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count',
    withKeystone(({ keystone }) => match(keystone, { count: 1 }, [{ name: 'person2', count: 1 }]))
  );

  test(
    'Filter: count_not',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not: 1 }, [
        { name: 'person1', count: 0 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not: null }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );

  test(
    'Filter: count_lt',
    withKeystone(({ keystone }) =>
      match(keystone, { count_lt: 2 }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
      ])
    )
  );

  test(
    'Filter: count_lte',
    withKeystone(({ keystone }) =>
      match(keystone, { count_lte: 2 }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ])
    )
  );

  test(
    'Filter: count_gt',
    withKeystone(({ keystone }) =>
      match(keystone, { count_gt: 2 }, [{ name: 'person4', count: 3 }])
    )
  );

  test(
    'Filter: count_gte',
    withKeystone(({ keystone }) =>
      match(keystone, { count_gte: 2 }, [
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );

  test(
    'Filter: count_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { count_in: [] }, []))
  );

  test(
    'Filter: count_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not_in: [] }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_in',
    withKeystone(({ keystone }) =>
      match(keystone, { count_in: [0, 1, 2] }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
      ])
    )
  );

  test(
    'Filter: count_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not_in: [0, 1, 2] }, [
        { name: 'person4', count: 3 },
        { name: 'person5', count: null },
      ])
    )
  );

  test(
    'Filter: count_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { count_in: [null] }, [{ name: 'person5', count: null }])
    )
  );

  test(
    'Filter: count_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { count_not_in: [null] }, [
        { name: 'person1', count: 0 },
        { name: 'person2', count: 1 },
        { name: 'person3', count: 2 },
        { name: 'person4', count: 3 },
      ])
    )
  );
};
