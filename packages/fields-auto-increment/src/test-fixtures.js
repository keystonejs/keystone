import { getItems } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';
import { AutoIncrement } from './index';

export const name = 'AutoIncrement';
export const type = AutoIncrement;
export const exampleValue = () => 35;
export const exampleValue2 = () => 36;
export const supportsUnique = true;
export const fieldName = 'orderNumber';
export const skipCreateTest = true;
export const skipUpdateTest = true;

// `AutoIncrement` field type is not supported by `mongoose`. So, we need to filter it out while performing `API` tests.
export const unSupportedAdapterList = ['mongoose'];

// Be default, `AutoIncrement` are read-only. But for `isRequired` test purpose, we need to bypass these restrictions.
export const fieldConfig = () => ({ access: { create: true, update: true } });

export const getTestFields = () => ({
  name: { type: Text },
  orderNumber: { type, gqlType: 'Int' },
});

export const initItems = () => {
  return [
    { name: 'product1' },
    { name: 'product2' },
    { name: 'product3' },
    { name: 'product4' },
    { name: 'product5' },
    { name: 'product6' },
    { name: 'product7' },
  ];
};

export const storedValues = () => [
  { name: 'product1', orderNumber: 1 },
  { name: 'product2', orderNumber: 2 },
  { name: 'product3', orderNumber: 3 },
  { name: 'product4', orderNumber: 4 },
  { name: 'product5', orderNumber: 5 },
  { name: 'product6', orderNumber: 6 },
  { name: 'product7', orderNumber: 7 },
];

export const supportedFilters = [];

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name orderNumber',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    'Filter: orderNumber',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber: 1 }, [{ name: 'product1', orderNumber: 1 }])
    )
  );

  test(
    'Filter: orderNumber_not',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not: 1 }, [
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ])
    )
  );

  test(
    'Filter: orderNumber_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not: null }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ])
    )
  );

  test(
    'Filter: orderNumber_lt',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_lt: 2 }, [{ name: 'product1', orderNumber: 1 }])
    )
  );

  test(
    'Filter: orderNumber_lte',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_lte: 2 }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
      ])
    )
  );

  test(
    'Filter: orderNumber_gt',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_gt: 2 }, [
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ])
    )
  );

  test(
    'Filter: orderNumber_gte',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_gte: 2 }, [
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ])
    )
  );

  test(
    'Filter: orderNumber_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_in: [] }, []))
  );

  test(
    'Filter: orderNumber_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [] }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ])
    )
  );

  test(
    'Filter: orderNumber_in',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_in: [1, 2, 3] }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
      ])
    )
  );

  test(
    'Filter: orderNumber_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [1, 2, 3] }, [
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ])
    )
  );

  test(
    'Filter: orderNumber_in null',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_in: [null] }, []))
  );

  test(
    'Filter: orderNumber_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [null] }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ])
    )
  );
};
