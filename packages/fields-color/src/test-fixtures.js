import { getItems } from '@keystonejs/server-side-graphql-client';
import { Color } from '.';
import { Text } from '@keystonejs/fields';

export const name = 'Color';
export { Color as type };
export const exampleValue = '"red"';
export const exampleValue2 = '"green"';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    name: { type: Text },
    hexColor: { type: Color },
  };
};

export const initItems = () => {
  return [
    { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
    { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
    { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
    { name: 'd', hexColor: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name hexColor',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor: 'rgba(45, 228, 39, 1)' }, [
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_not',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not: 'rgba(45, 228, 39, 1)' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not: null }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { hexColor_in: [] }, []))
  );

  test(
    'Filter: hexColor_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_in: [] }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor_in',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          hexColor_in: ['rgba(223, 57, 57, 1)', 'rgba(45, 228, 39, 1)'],
        },
        [
          { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
          { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        ]
      )
    )
  );

  test(
    'Filter: hexColor_not_in',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          hexColor_not_in: [null, 'rgba(223, 57, 57, 1)', 'rgba(45, 228, 39, 1)'],
        },
        [{ name: 'c', hexColor: 'rgba(50, 121, 206, 1)' }]
      )
    )
  );

  test(
    'Filter: hexColor_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_in: [null] }, [{ name: 'd', hexColor: null }])
    )
  );

  test(
    'Filter: hexColor_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_in: [null] }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_contains',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_contains: '57' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_not_contains',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_contains: '57' }, [
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor_starts_with',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_starts_with: 'rgba(45' }, [
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
      ])
    )
  );
  test(
    'Filter: hexColor_not_starts_with',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_starts_with: 'rgba(45' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor_ends_with',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_ends_with: '39, 1)' }, [
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_not_ends_with',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_ends_with: '39, 1)' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: null },
      ])
    )
  );
};
