import { getItems } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';
import { AutoIncrement } from './index';

export const name = 'AutoIncrement';
export const type = AutoIncrement;
export const testMatrix = ['ID', 'Int'];
export const exampleValue = matrixValue => (matrixValue === 'ID' ? '35' : 35);
export const exampleValue2 = matrixValue => (matrixValue === 'ID' ? '36' : 36);
export const supportsUnique = true;
export const fieldName = 'orderNumber';
export const skipCreateTest = false;
export const skipUpdateTest = true;

// `AutoIncrement` field type is not supported by `mongoose`. So, we need to filter it out while performing `API` tests.
export const unSupportedAdapterList = ['mongoose'];

// Be default, `AutoIncrement` are read-only. But for `isRequired` test purpose, we need to bypass these restrictions.
export const fieldConfig = matrixValue => ({
  gqlType: matrixValue,
  access: { create: true, update: true },
});

export const getTestFields = matrixValue => ({
  name: { type: Text },
  orderNumber: { type, gqlType: matrixValue, access: { create: true } },
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

export const storedValues = matrixValue =>
  matrixValue === 'ID'
    ? [
        { name: 'product1', orderNumber: '1' },
        { name: 'product2', orderNumber: '2' },
        { name: 'product3', orderNumber: '3' },
        { name: 'product4', orderNumber: '4' },
        { name: 'product5', orderNumber: '5' },
        { name: 'product6', orderNumber: '6' },
        { name: 'product7', orderNumber: '7' },
      ]
    : [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
        { name: 'product6', orderNumber: 6 },
        { name: 'product7', orderNumber: 7 },
      ];

export const supportedFilters = () => [];

export const filterTests = (withKeystone, matrixValue) => {
  const _storedValues = storedValues(matrixValue);
  const _f = matrixValue === 'ID' ? x => x.toString() : x => x;
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'Test',
        where,
        returnFields: 'name orderNumber',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected.map(i => _storedValues[i]));

  test(
    'Filter: orderNumber',
    withKeystone(({ keystone }) => match(keystone, { orderNumber: _f(1) }, [0]))
  );

  test(
    'Filter: orderNumber_not',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_not: _f(1) }, [1, 2, 3, 4, 5, 6]))
  );

  test(
    'Filter: orderNumber_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not: null }, [0, 1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_lt',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_lt: _f(2) }, [0]))
  );

  test(
    'Filter: orderNumber_lte',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_lte: _f(2) }, [0, 1]))
  );

  test(
    'Filter: orderNumber_gt',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_gt: _f(2) }, [2, 3, 4, 5, 6]))
  );

  test(
    'Filter: orderNumber_gte',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_gte: _f(2) }, [1, 2, 3, 4, 5, 6]))
  );

  test(
    'Filter: orderNumber_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_in: [] }, []))
  );

  test(
    'Filter: orderNumber_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [] }, [0, 1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_in',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_in: [1, 2, 3].map(_f) }, [0, 1, 2])
    )
  );

  test(
    'Filter: orderNumber_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [1, 2, 3].map(_f) }, [3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_in null',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_in: [null] }, []))
  );

  test(
    'Filter: orderNumber_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [null] }, [0, 1, 2, 3, 4, 5, 6])
    )
  );
};
