import { getItems } from '@keystonejs/server-side-graphql-client';
import { Color } from '.';
import { Text } from '@keystonejs/fields';

export const name = 'Color';
export { Color as type };
export const exampleValue = 'red';
export const exampleValue2 = 'green';
export const supportsUnique = true;
export const fieldName = 'hexColor';

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
    { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
    { name: 'e', hexColor: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
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
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        { name: 'e', hexColor: null },
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
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        { name: 'e', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor: 'rgba(50, 121, 206, 1)' }, [
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_i: 'rgba(50, 121, 206, 1)' }, [
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_not (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not: 'rgba(50, 121, 206, 1)' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        { name: 'e', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor_not_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_i: 'rgba(50, 121, 206, 1)' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'e', hexColor: null },
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
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_in (case-sensitive, empty list)',
    withKeystone(({ keystone }) => match(keystone, { hexColor_in: [] }, []))
  );

  test(
    'Filter: hexColor_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_in: [] }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        { name: 'e', hexColor: null },
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
        [
          { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
          { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        ]
      )
    )
  );

  test(
    'Filter: hexColor_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_in: [null] }, [{ name: 'e', hexColor: null }])
    )
  );

  test(
    'Filter: hexColor_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_in: [null] }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
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
    'Filter: hexColor_contains (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_contains: 'rgba' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
      ])
    )
  );
  test(
    'Filter: hexColor_contains_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_contains_i: 'rgba' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_not_contains',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_contains: '57' }, [
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        { name: 'e', hexColor: null },
      ])
    )
  );

  test(
    'Filter: hexColor_starts_with (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_starts_with: 'rgba(50' }, [
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_starts_with_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_starts_with_i: 'rgba(50' }, [
        { name: 'c', hexColor: 'rgba(50, 121, 206, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
      ])
    )
  );

  test(
    'Filter: hexColor_not_starts_with (case-sensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_starts_with: 'rgba(50' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        { name: 'e', hexColor: null },
      ])
    )
  );
  test(
    'Filter: hexColor_not_starts_with_i (case-insensitive)',
    withKeystone(({ keystone }) =>
      match(keystone, { hexColor_not_starts_with_i: 'rgba(50' }, [
        { name: 'a', hexColor: 'rgba(223, 57, 57, 1)' },
        { name: 'b', hexColor: 'rgba(45, 228, 39, 1)' },
        { name: 'e', hexColor: null },
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
        { name: 'd', hexColor: 'RGBA(50, 121, 206, 1)' },
        { name: 'e', hexColor: null },
      ])
    )
  );
};
