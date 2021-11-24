import { KeystoneContext } from '../../../../../types';
import { integer } from '../../index';

export const name = 'Integer with autoincrement default';
export const typeFunction = (config: any) =>
  integer({
    ...config,
    db: { ...config?.db, isNullable: false },
    defaultValue: { kind: 'autoincrement' },
  });
export const exampleValue = () => 35;
export const exampleValue2 = () => 36;
export const supportsUnique = true;
export const fieldName = 'orderNumber';
export const supportsGraphQLIsNonNull = true;
export const supportsDbMap = true;
export const skipRequiredTest = true;
export const skipCreateTest = false;
export const skipUpdateTest = true;

export const unSupportedAdapterList = ['sqlite'];

export const getTestFields = () => ({
  orderNumber: integer({ db: { isNullable: false }, defaultValue: { kind: 'autoincrement' } }),
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

export const supportedFilters = () => [];

export const filterTests = (withKeystone: (arg: any) => any) => {
  const _storedValues = storedValues();
  const match = async (context: KeystoneContext, where: Record<string, any>, expected: any[]) =>
    expect(
      await context.query.Test.findMany({
        where,
        orderBy: { name: 'asc' },
        query: 'name orderNumber',
      })
    ).toEqual(expected.map(i => _storedValues[i]));

  test(
    'Filter: equals',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { equals: 1 } }, [0])
    )
  );

  test(
    'Filter: not',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { not: { equals: 1 } } }, [1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: lt',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { lt: 2 } }, [0])
    )
  );

  test(
    'Filter: lte',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { lte: 2 } }, [0, 1])
    )
  );

  test(
    'Filter: gt',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { gt: 2 } }, [2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: gte',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { gte: 2 } }, [1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: in (empty list)',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { in: [] } }, [])
    )
  );

  test(
    'Filter: not in (empty list)',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { notIn: [] } }, [0, 1, 2, 3, 4, 5, 6])
    )
  );

  test(
    'Filter: in',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { in: [1, 2, 3] } }, [0, 1, 2])
    )
  );

  test(
    'Filter: not in',
    withKeystone(({ context }: { context: KeystoneContext }) =>
      match(context, { orderNumber: { notIn: [1, 2, 3] } }, [3, 4, 5, 6])
    )
  );
};
