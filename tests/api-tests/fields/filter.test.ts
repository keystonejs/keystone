import path from 'path';
import globby from 'globby';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { KeystoneContext } from '@keystone-next/types';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig } from '../utils';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.{js,ts}`, {
  absolute: true,
});
testModules.push(path.resolve('packages/fields/src/tests/test-fixtures.ts'));

const provider = process.env.TEST_ADAPTER;

testModules
  .map(require)
  .filter(({ unSupportedAdapterList = [] }) => !unSupportedAdapterList.includes(provider))
  .forEach(mod => {
    (mod.testMatrix || ['default']).forEach((matrixValue: string) => {
      const listKey = 'Test';
      const runner = setupTestRunner({
        config: apiTestConfig({
          lists: createSchema({
            [listKey]: list({ fields: mod.getTestFields(matrixValue) }),
          }),
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

          const match = async (
            context: KeystoneContext,
            where: Record<string, any> | undefined,
            expected: any[],
            orderBy: Record<string, 'asc' | 'desc'> = { name: 'asc' }
          ) =>
            expect(await context.lists[listKey].findMany({ where, orderBy, query })).toEqual(
              expected.map(i => storedValues[i])
            );

          test(
            `No Filter`,
            withKeystone(({ context }) => match(context, undefined, [0, 1, 2, 3, 4, 5, 6]))
          );

          test(
            `Empty Filter`,
            withKeystone(({ context }) => match(context, {}, [0, 1, 2, 3, 4, 5, 6]))
          );
          if (mod.supportedFilters(provider).includes('null_equality')) {
            test(
              'Equals null',
              withKeystone(({ context }) => match(context, { [`${fieldName}`]: null }, [5, 6]))
            );
            test(
              'Not Equals null',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not`]: null }, [0, 1, 2, 3, 4])
              )
            );
          }
          if (mod.supportedFilters(provider).includes('equality')) {
            test(
              'Equals',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}`]: storedValues[3][fieldName] }, [3])
              )
            );
            test(
              'Not Equals',
              withKeystone(({ context }) =>
                match(
                  context,
                  { [`${fieldName}_not`]: storedValues[3][fieldName] },
                  [0, 1, 2, 4, 5, 6]
                )
              )
            );
          }
          if (mod.supportedFilters(provider).includes('equality_case_insensitive')) {
            test(
              `Equals - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_i`]: storedValues[3][fieldName] }, [2, 3, 4])
              )
            );

            test(
              `Not Equals - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_i`]: storedValues[3][fieldName] }, [0, 1, 5, 6])
              )
            );
          }
          if (mod.supportedFilters(provider).includes('string')) {
            test(
              `Contains`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_contains`]: 'oo' }, [3, 4])
              )
            );
            test(
              `Not Contains`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_contains`]: 'oo' }, [0, 1, 2, 5, 6])
              )
            );
            test(
              `Starts With`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_starts_with`]: 'foo' }, [3, 4])
              )
            );
            test(
              `Not Starts With`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_starts_with`]: 'foo' }, [0, 1, 2, 5, 6])
              )
            );
            test(
              `Ends With`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_ends_with`]: 'BAR' }, [2, 3])
              )
            );
            test(
              `Not Ends With`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_ends_with`]: 'BAR' }, [0, 1, 4, 5, 6])
              )
            );
          }
          if (mod.supportedFilters(provider).includes('string_case_insensitive')) {
            test(
              `Contains - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_contains_i`]: 'oo' }, [2, 3, 4])
              )
            );

            test(
              `Not Contains - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_contains_i`]: 'oo' }, [0, 1, 5, 6])
              )
            );

            test(
              `Starts With - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_starts_with_i`]: 'foo' }, [2, 3, 4])
              )
            );

            test(
              `Not Starts With - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_starts_with_i`]: 'foo' }, [0, 1, 5, 6])
              )
            );

            test(
              `Ends With - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_ends_with_i`]: 'BAR' }, [2, 3, 4])
              )
            );

            test(
              `Not Ends With - Case Insensitive`,
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_ends_with_i`]: 'BAR' }, [0, 1, 5, 6])
              )
            );
          }
          if (mod.supportedFilters(provider).includes('ordering')) {
            test(
              'Less than',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_lt`]: storedValues[2][fieldName] }, [0, 1])
              )
            );
            test(
              'Less than or equal',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_lte`]: storedValues[2][fieldName] }, [0, 1, 2])
              )
            );
            test(
              'Greater than',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_gt`]: storedValues[2][fieldName] }, [3, 4])
              )
            );
            test(
              'Greater than or equal',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_gte`]: storedValues[2][fieldName] }, [2, 3, 4])
              )
            );
          }
          if (mod.supportedFilters(provider).includes('in_empty_null')) {
            test(
              'In - Empty List',
              withKeystone(({ context }) => match(context, { [`${fieldName}_in`]: [] }, []))
            );

            test(
              'Not In - Empty List',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_in`]: [] }, [0, 1, 2, 3, 4, 5, 6])
              )
            );

            test(
              'In - null',
              withKeystone(({ context }) => match(context, { [`${fieldName}_in`]: [null] }, [5, 6]))
            );

            test(
              'Not In - null',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_not_in`]: [null] }, [0, 1, 2, 3, 4])
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
                    [`${fieldName}_in`]: [
                      storedValues[0][fieldName],
                      storedValues[2][fieldName],
                      storedValues[4][fieldName],
                    ],
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
                    [`${fieldName}_not_in`]: [
                      storedValues[0][fieldName],
                      storedValues[2][fieldName],
                      storedValues[4][fieldName],
                    ],
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
                match(context, { [`${fieldName}_is_set`]: true }, [0, 2, 3, 4])
              )
            );
            test(
              'Is Set - false',
              withKeystone(({ context }) =>
                match(context, { [`${fieldName}_is_set`]: false }, [1, 5, 6])
              )
            );
          }
          if (mod.supportedFilters(provider).includes('unique_equality')) {
            test(
              'Unique equality',
              setupTestRunner({
                config: apiTestConfig({
                  lists: createSchema({
                    [listKey]: list({
                      fields: {
                        field: mod.typeFunction({ isUnique: true }),
                      },
                    }),
                  }),
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
      }
    });
  });
