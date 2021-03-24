// @ts-ignore
import { getItems } from '@keystone-next/server-side-graphql-client-legacy';
// @ts-ignore
import { Text } from '@keystone-next/fields-legacy';
// @ts-ignore
import { AutoIncrement } from '@keystone-next/fields-auto-increment-legacy/src';

type MatrixValue = typeof testMatrix[number];

export const name = 'AutoIncrement';
export const type = AutoIncrement;
export const testMatrix = ['ID', 'Int'] as const;
export const exampleValue = (matrixValue: MatrixValue) => (matrixValue === 'ID' ? '35' : 35);
export const exampleValue2 = (matrixValue: MatrixValue) => (matrixValue === 'ID' ? '36' : 36);
export const supportsUnique = true;
export const fieldName = 'orderNumber';
export const skipCreateTest = false;
export const skipUpdateTest = true;

// `AutoIncrement` field type is not supported by `mongoose`. So, we need to filter it out while performing `API` tests.
export const unSupportedAdapterList = ['mongoose', 'prisma_sqlite'];

// Be default, `AutoIncrement` are read-only. But for `isRequired` test purpose, we need to bypass these restrictions.
export const fieldConfig = (matrixValue: MatrixValue) => ({
  gqlType: matrixValue,
  access: { create: true, update: true },
});

export const getTestFields = (matrixValue: MatrixValue) => ({
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

export const storedValues = (matrixValue: MatrixValue) =>
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

export const filterTests = (withKeystone: (arg: any) => any, matrixValue: MatrixValue) => {
  const _storedValues = storedValues(matrixValue);
  const _f = matrixValue === 'ID' ? (x: any) => x.toString() : (x: any) => x;
  const match = async (keystone: any, where: Record<string, any>, expected: any[]) =>
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
    withKeystone(({ keystone }: { keystone: any }) => match(keystone, { orderNumber: _f(1) }, [0]))
  );

  test(
    'Filter: orderNumber_not',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_not: _f(1) }, [1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_not null',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_not: null }, [0, 1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_lt',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_lt: _f(2) }, [0])
    )
  );

  test(
    'Filter: orderNumber_lte',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_lte: _f(2) }, [0, 1])
    )
  );

  test(
    'Filter: orderNumber_gt',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_gt: _f(2) }, [2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_gte',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_gte: _f(2) }, [1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_in (empty list)',
    withKeystone(({ keystone }: { keystone: any }) => match(keystone, { orderNumber_in: [] }, []))
  );

  test(
    'Filter: orderNumber_not_in (empty list)',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_not_in: [] }, [0, 1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_in',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_in: ([1, 2, 3] as const).map(_f) }, [0, 1, 2])
    )
  );

  test(
    'Filter: orderNumber_not_in',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_not_in: [1, 2, 3].map(_f) }, [3, 4, 5, 6])
    )
  );

  test(
    'Filter: orderNumber_in null',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_in: [null] }, [])
    )
  );

  test(
    'Filter: orderNumber_not_in null',
    withKeystone(({ keystone }: { keystone: any }) =>
      match(keystone, { orderNumber_not_in: [null] }, [0, 1, 2, 3, 4, 5, 6])
    )
  );
};
