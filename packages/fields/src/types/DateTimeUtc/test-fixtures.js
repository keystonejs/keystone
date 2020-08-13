import { getItems } from '@keystonejs/server-side-graphql-client';
import Text from '../Text';
import DateTimeUtc from './';

export const name = 'DateTimeUtc';
export { DateTimeUtc as type };
export const exampleValue = '"1990-12-31T12:34:56.789Z"';
export const exampleValue2 = '"2000-01-20T00:08:00.000Z"';
export const supportsUnique = true;

export const getTestFields = () => {
  return {
    name: { type: Text },
    lastOnline: { type: DateTimeUtc },
  };
};

export const initItems = () => {
  return [
    { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
    { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
    { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
    { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
    { name: 'person5', lastOnline: null },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name lastOnline',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Filter: lastOnline',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline: '2000-01-20T00:08:00.000Z' }, [
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
      ])
    )
  );

  test(
    'Filter: lastOnline_not',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_not: '2000-01-20T00:08:00.000Z' }, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Filter: lastOnline_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_not: null }, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
      ])
    )
  );

  test(
    'Filter: lastOnline_lt',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_lt: '1950-10-01T23:59:59.999Z' }, [
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
      ])
    )
  );

  test(
    'Filter: lastOnline_lte',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_lte: '1950-10-01T23:59:59.999Z' }, [
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
      ])
    )
  );

  test(
    'Filter: lastOnline_gt',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_gt: '1950-10-01T23:59:59.999Z' }, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
      ])
    )
  );

  test(
    'Filter: lastOnline_gte',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_gte: '1950-10-01T23:59:59.999Z' }, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
      ])
    )
  );

  test(
    'Filter: lastOnline_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { lastOnline_in: [] }, []))
  );

  test(
    'Filter: lastOnline_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_not_in: [] }, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
        { name: 'person5', lastOnline: null },
      ])
    )
  );

  test(
    'Filter: lastOnline_in',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          lastOnline_in: [
            '1990-12-31T12:34:56.789Z',
            '2000-01-20T00:08:00.000Z',
            '1950-10-01T23:59:59.999Z',
          ],
        },
        [
          { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
          { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
          { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        ]
      )
    )
  );

  test(
    'Filter: lastOnline_not_in',
    withKeystone(({ keystone }) =>
      match(
        keystone,
        {
          lastOnline_not_in: [
            '1990-12-31T12:34:56.789Z',
            '2000-01-20T00:08:00.000Z',
            '1950-10-01T23:59:59.999Z',
          ],
        },
        [
          { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
          { name: 'person5', lastOnline: null },
        ]
      )
    )
  );

  test(
    'Filter: lastOnline_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_in: [null] }, [{ name: 'person5', lastOnline: null }])
    )
  );

  test(
    'Filter: lastOnline_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { lastOnline_not_in: [null] }, [
        { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
        { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
        { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
        { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
      ])
    )
  );

  test(
    'Sorting: sortBy: lastOnline_ASC',
    withKeystone(({ keystone, adapterName }) =>
      match(
        keystone,
        undefined,
        adapterName === 'mongoose'
          ? [
              { name: 'person5', lastOnline: null },
              { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
              { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
              { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
              { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
            ]
          : [
              { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
              { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
              { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
              { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
              { name: 'person5', lastOnline: null },
            ],
        'lastOnline_ASC'
      )
    )
  );

  test(
    'Sorting: sortBy: lastOnline_DESC',
    withKeystone(({ keystone, adapterName }) =>
      match(
        keystone,
        undefined,
        adapterName === 'mongoose'
          ? [
              { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
              { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
              { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
              { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
              { name: 'person5', lastOnline: null },
            ]
          : [
              { name: 'person5', lastOnline: null },
              { name: 'person2', lastOnline: '2000-01-20T00:08:00.000Z' },
              { name: 'person1', lastOnline: '1990-12-31T12:34:56.789Z' },
              { name: 'person3', lastOnline: '1950-10-01T23:59:59.999Z' },
              { name: 'person4', lastOnline: '1666-04-12T00:08:00.000Z' },
            ],
        'lastOnline_DESC'
      )
    )
  );
};
