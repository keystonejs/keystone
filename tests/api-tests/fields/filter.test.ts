import globby from 'globby';
import { list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';
import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../utils';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});

const provider = process.env.TEST_ADAPTER;

testModules
  .map(require)
  .filter(({ unSupportedAdapterList = [] }) => !unSupportedAdapterList.includes(provider))
  .forEach(mod => {
    (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
      const listKey = 'Test';
      const runner = setupTestRunner({
        config: apiTestConfig({
          lists: {
            [listKey]: list({
              fields: { name: text({ isOrderable: true }), ...mod.getTestFields(matrixValue) },
            }),
          },
          images: { upload: 'local', local: { storagePath: 'tmp_test_images' } },
          files: { upload: 'local', local: { storagePath: 'tmp_test_files' } },
        }),
      });
      const withKeystone = (testFn: (args: any) => void = () => {}) =>
        runner(async ({ context, ...rest }) => {
          // Populate the database before running the tests
          // Note: this seeding has to be in an order defined by the array returned by `mod.initItems()`
          for (const data of mod.initItems(matrixValue)) {
            await context.lists[listKey].createOne({ data });
          }
          return testFn({ context, listKey, provider, ...rest });
        });

      if (mod.filterTests) {
        describe(`${mod.name} - ${matrixValue} - Custom Filtering`, () => {
          beforeEach(() => {
            if (mod.beforeEach) {
              mod.beforeEach();
            }
          });
          afterEach(async () => {
            if (mod.afterEach) {
              await mod.afterEach();
            }
          });
          beforeAll(() => {
            if (mod.beforeAll) {
              mod.beforeAll();
            }
          });
          afterAll(async () => {
            if (mod.afterAll) {
              await mod.afterAll();
            }
          });
          mod.filterTests(withKeystone, matrixValue);
        });
      }

      if (!mod.skipCommonFilterTest) {
        describe(`${mod.name} - ${matrixValue} - Common Filtering`, () => {
          beforeEach(() => {
            if (mod.beforeEach) {
              mod.beforeEach();
            }
          });
          afterEach(async () => {
            if (mod.afterEach) {
              await mod.afterEach();
            }
          });
          beforeAll(() => {
            if (mod.beforeAll) {
              mod.beforeAll();
            }
          });
          afterAll(async () => {
            if (mod.afterAll) {
              await mod.afterAll();
            }
          });
          const { readFieldName, fieldName, subfieldName, storedValues: _storedValues } = mod;
          const storedValues = _storedValues(matrixValue);
          const query = readFieldName
            ? `name ${readFieldName}`
            : subfieldName
            ? `name ${fieldName} { ${subfieldName} }`
            : `name ${fieldName}`;

          describe.each(['without negation', 'with negation'] as const)('%s', kind => {
            const match = async (
              context: KeystoneContext,
              where: Record<string, any> | undefined,
              expectedIndexes: number[]
            ) => {
              let expected = expectedIndexes.map(i => storedValues[i]);
              if (kind === 'with negation') {
                const expectedWithoutNegation = new Set(expected);
                expected = storedValues.filter((v: any) => !expectedWithoutNegation.has(v));
              }
              expect(
                await context.lists[listKey].findMany({
                  where: kind === 'with negation' ? { NOT: where } : where,
                  orderBy: { name: 'asc' },
                  query,
                })
              ).toEqual(expected);
            };

            if (kind === 'without negation') {
              test(
                `No Filter`,
                withKeystone(({ context }) => match(context, undefined, [0, 1, 2, 3, 4, 5, 6]))
              );
              // arguably this should return [] when negated
              // but i assume prisma is like "this things empty, let's just ignore it"
              // this is fine imo since "i want to query this api and have it definitely return no results"
              // isn't really very useful
              test(
                `Empty Filter`,
                withKeystone(({ context }) => match(context, {}, [0, 1, 2, 3, 4, 5, 6]))
              );
            }

            if (mod.supportedFilters(provider).includes('null_equality')) {
              test(
                'Equals null',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { equals: null } }, [5, 6])
                )
              );
              test(
                'Not Equals null',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { not: { equals: null } } }, [0, 1, 2, 3, 4])
                )
              );
            }
            if (mod.supportedFilters(provider).includes('equality')) {
              test(
                'Equals',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { equals: storedValues[3][fieldName] } }, [3])
                )
              );
              test(
                'Not Equals',
                withKeystone(({ context }) =>
                  match(
                    context,
                    { NOT: { [`${fieldName}`]: { equals: storedValues[3][fieldName] } } },
                    [0, 1, 2, 4, 5, 6]
                  )
                )
              );
            }
            if (mod.supportedFilters(provider).includes('equality_case_insensitive')) {
              test(
                `Equals - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    {
                      [`${fieldName}`]: { equals: storedValues[3][fieldName], mode: 'insensitive' },
                    },
                    [2, 3, 4]
                  )
                )
              );

              test(
                `Not Equals - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    {
                      [`${fieldName}`]: {
                        mode: 'insensitive',
                        not: { equals: storedValues[3][fieldName] },
                      },
                    },
                    [0, 1, 5, 6]
                  )
                )
              );
            }
            if (mod.supportedFilters(provider).includes('string')) {
              test(
                `Contains`,
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { contains: 'oo' } }, [3, 4])
                )
              );
              test(
                `Not Contains`,
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { not: { contains: 'oo' } } }, [0, 1, 2, 5, 6])
                )
              );
              test(
                `Starts With`,
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { startsWith: 'foo' } }, [3, 4])
                )
              );
              test(
                `Not Starts With`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { not: { startsWith: 'foo' } } },
                    [0, 1, 2, 5, 6]
                  )
                )
              );
              test(
                `Ends With`,
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { endsWith: 'BAR' } }, [2, 3])
                )
              );
              test(
                `Not Ends With`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { not: { endsWith: 'BAR' } } },
                    [0, 1, 4, 5, 6]
                  )
                )
              );
            }
            if (mod.supportedFilters(provider).includes('string_case_insensitive')) {
              test(
                `Contains - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { mode: 'insensitive', contains: 'oo' } },
                    [2, 3, 4]
                  )
                )
              );

              test(
                `Not Contains - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { mode: 'insensitive', not: { contains: 'oo' } } },
                    [0, 1, 5, 6]
                  )
                )
              );

              test(
                `Starts With - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { mode: 'insensitive', startsWith: 'foo' } },
                    [2, 3, 4]
                  )
                )
              );

              test(
                `Not Starts With - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { mode: 'insensitive', not: { startsWith: 'foo' } } },
                    [0, 1, 5, 6]
                  )
                )
              );

              test(
                `Ends With - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { mode: 'insensitive', endsWith: 'BAR' } },
                    [2, 3, 4]
                  )
                )
              );

              test(
                `Not Ends With - Case Insensitive`,
                withKeystone(({ context }) =>
                  match(
                    context,
                    {
                      [`${fieldName}`]: { mode: 'insensitive', not: { endsWith: 'BAR' } },
                    },
                    [0, 1, 5, 6]
                  )
                )
              );
            }
            if (mod.supportedFilters(provider).includes('ordering')) {
              test(
                'Less than',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { lt: storedValues[2][fieldName] } }, [0, 1])
                )
              );
              test(
                'Less than or equal',
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { lte: storedValues[2][fieldName] } },
                    [0, 1, 2]
                  )
                )
              );
              test(
                'Greater than',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { gt: storedValues[2][fieldName] } }, [3, 4])
                )
              );
              test(
                'Greater than or equal',
                withKeystone(({ context }) =>
                  match(
                    context,
                    { [`${fieldName}`]: { gte: storedValues[2][fieldName] } },
                    [2, 3, 4]
                  )
                )
              );
            }
            if (mod.supportedFilters(provider).includes('in_empty_null')) {
              test(
                'In - Empty List',
                withKeystone(({ context }) => match(context, { [`${fieldName}`]: { in: [] } }, []))
              );

              test(
                'Not In - Empty List',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { notIn: [] } }, [0, 1, 2, 3, 4, 5, 6])
                )
              );
            }
            if (mod.supportedFilters(provider).includes('in_equal')) {
              test(
                'In - values',
                withKeystone(({ context }) =>
                  match(
                    context,
                    {
                      [`${fieldName}`]: {
                        in: [
                          storedValues[0][fieldName],
                          storedValues[2][fieldName],
                          storedValues[4][fieldName],
                        ],
                      },
                    },
                    [0, 2, 4]
                  )
                )
              );
              test(
                'Not In - values',
                withKeystone(({ context }) =>
                  match(
                    context,
                    {
                      [`${fieldName}`]: {
                        notIn: [
                          storedValues[0][fieldName],
                          storedValues[2][fieldName],
                          storedValues[4][fieldName],
                        ],
                      },
                    },
                    [1, 3, 5, 6]
                  )
                )
              );
            }
            if (mod.supportedFilters(provider).includes('is_set')) {
              test(
                'Is Set - true',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { isSet: true } }, [0, 2, 3, 4])
                )
              );
              test(
                'Is Set - false',
                withKeystone(({ context }) =>
                  match(context, { [`${fieldName}`]: { isSet: false } }, [1, 5, 6])
                )
              );
            }
            if (mod.supportedFilters(provider).includes('unique_equality')) {
              test(
                'Unique equality',
                setupTestRunner({
                  config: apiTestConfig({
                    lists: {
                      [listKey]: list({
                        fields: {
                          field: mod.typeFunction({ isIndexed: 'unique', isFilterable: true }),
                        },
                      }),
                    },
                  }),
                })(async ({ context }) => {
                  // Populate the database before running the tests
                  // Note: this seeding has to be in an order defined by the array returned by `mod.initItems()`
                  for (const data of mod.initItems(matrixValue)) {
                    await context.lists[listKey].createOne({
                      data: { field: data[fieldName] },
                    });
                  }
                  await Promise.all(
                    storedValues.map(async (val: any) => {
                      const promise = context.lists[listKey].findOne({
                        where: { field: val[fieldName] },
                        query: 'field',
                      });
                      if (val[fieldName] === null) {
                        expect(await promise.catch(x => x.toString())).toMatch(
                          'The unique value provided in a unique where input must not be null'
                        );
                      } else {
                        expect(await promise).toEqual({ field: val[fieldName] });
                      }
                    })
                  );
                })
              );
            }
          });
        });
      }
    });
  });
