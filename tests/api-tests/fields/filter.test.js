const globby = require('globby');
const path = require('path');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
import { createItem, getItems } from '@keystonejs/server-side-graphql-client';

const testModules = globby.sync(`{packages,packages-next}/**/src/**/test-fixtures.js`, {
  absolute: true,
});
testModules.push(path.resolve('packages/fields/tests/test-fixtures.js'));

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`${adapterName} adapter`, () => {
    testModules
      .map(require)
      .filter(
        ({ skipCrudTest, unSupportedAdapterList = [] }) =>
          !skipCrudTest && !unSupportedAdapterList.includes(adapterName)
      )
      .forEach(mod => {
        (mod.testMatrix || ['default']).forEach(matrixValue => {
          const listKey = 'Test';
          const withKeystone = (testFn = () => {}) =>
            runner(
              () => {
                const createLists = keystone => {
                  // Create a list with all the fields required for testing
                  keystone.createList(listKey, { fields: mod.getTestFields(matrixValue) });
                };
                return setupServer({ adapterName, createLists });
              },
              async ({ keystone, ...rest }) => {
                // Populate the database before running the tests
                // Note: this seeding has to be in an order defined by the array returned by `mod.initItems()`
                for (const item of mod.initItems(matrixValue)) {
                  await createItem({ keystone, listKey, item });
                }
                return testFn({ keystone, listKey, adapterName, ...rest });
              }
            );

          if (mod.filterTests) {
            describe(`${mod.name} - ${matrixValue} - Custom Filtering`, () => {
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
              const returnFields = readFieldName
                ? `name ${readFieldName}`
                : subfieldName
                ? `name ${fieldName} { ${subfieldName} }`
                : `name ${fieldName}`;

              const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
                expect(await getItems({ keystone, listKey, where, returnFields, sortBy })).toEqual(
                  expected.map(i => storedValues[i])
                );

              test(
                `No Filter`,
                withKeystone(({ keystone }) => match(keystone, undefined, [0, 1, 2, 3, 4, 5, 6]))
              );

              test(
                `Empty Filter`,
                withKeystone(({ keystone }) => match(keystone, {}, [0, 1, 2, 3, 4, 5, 6]))
              );
              if (mod.supportedFilters(adapterName).includes('null_equality')) {
                test(
                  'Equals null',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}`]: null }, [5, 6])
                  )
                );
                test(
                  'Not Equals null',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not`]: null }, [0, 1, 2, 3, 4])
                  )
                );
              }
              if (mod.supportedFilters(adapterName).includes('equality')) {
                test(
                  'Equals',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}`]: storedValues[3][fieldName] }, [3])
                  )
                );
                test(
                  'Not Equals',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not`]: storedValues[3][fieldName] }, [
                      0,
                      1,
                      2,
                      4,
                      5,
                      6,
                    ])
                  )
                );
              }
              if (mod.supportedFilters(adapterName).includes('equality_case_insensitive')) {
                test(
                  `Equals - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_i`]: storedValues[3][fieldName] }, [2, 3, 4])
                  )
                );

                test(
                  `Not Equals - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_i`]: storedValues[3][fieldName] }, [
                      0,
                      1,
                      5,
                      6,
                    ])
                  )
                );
              }
              if (mod.supportedFilters(adapterName).includes('string')) {
                test(
                  `Contains`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_contains`]: 'oo' }, [3, 4])
                  )
                );
                test(
                  `Not Contains`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_contains`]: 'oo' }, [0, 1, 2, 5, 6])
                  )
                );
                test(
                  `Starts With`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_starts_with`]: 'foo' }, [3, 4])
                  )
                );
                test(
                  `Not Starts With`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_starts_with`]: 'foo' }, [0, 1, 2, 5, 6])
                  )
                );
                test(
                  `Ends With`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_ends_with`]: 'BAR' }, [2, 3])
                  )
                );
                test(
                  `Not Ends With`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_ends_with`]: 'BAR' }, [0, 1, 4, 5, 6])
                  )
                );
              }
              if (mod.supportedFilters(adapterName).includes('string_case_insensitive')) {
                test(
                  `Contains - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_contains_i`]: 'oo' }, [2, 3, 4])
                  )
                );

                test(
                  `Not Contains - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_contains_i`]: 'oo' }, [0, 1, 5, 6])
                  )
                );

                test(
                  `Starts With - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_starts_with_i`]: 'foo' }, [2, 3, 4])
                  )
                );

                test(
                  `Not Starts With - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_starts_with_i`]: 'foo' }, [0, 1, 5, 6])
                  )
                );

                test(
                  `Ends With - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_ends_with_i`]: 'BAR' }, [2, 3, 4])
                  )
                );

                test(
                  `Not Ends With - Case Insensitive`,
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_ends_with_i`]: 'BAR' }, [0, 1, 5, 6])
                  )
                );
              }
              if (mod.supportedFilters(adapterName).includes('ordering')) {
                test(
                  'Less than',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_lt`]: storedValues[2][fieldName] }, [0, 1])
                  )
                );
                test(
                  'Less than or equal',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_lte`]: storedValues[2][fieldName] }, [0, 1, 2])
                  )
                );
                test(
                  'Greater than',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_gt`]: storedValues[2][fieldName] }, [3, 4])
                  )
                );
                test(
                  'Greater than or equal',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_gte`]: storedValues[2][fieldName] }, [2, 3, 4])
                  )
                );
              }
              if (mod.supportedFilters(adapterName).includes('in_empty_null')) {
                test(
                  'In - Empty List',
                  withKeystone(({ keystone }) => match(keystone, { [`${fieldName}_in`]: [] }, []))
                );

                test(
                  'Not In - Empty List',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_in`]: [] }, [0, 1, 2, 3, 4, 5, 6])
                  )
                );

                test(
                  'In - null',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_in`]: [null] }, [5, 6])
                  )
                );

                test(
                  'Not In - null',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_not_in`]: [null] }, [0, 1, 2, 3, 4])
                  )
                );
              }
              if (mod.supportedFilters(adapterName).includes('in_equal')) {
                test(
                  'In - values',
                  withKeystone(({ keystone }) =>
                    match(
                      keystone,
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
                  withKeystone(({ keystone }) =>
                    match(
                      keystone,
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
              if (mod.supportedFilters(adapterName).includes('is_set')) {
                test(
                  'Is Set - true',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_is_set`]: true }, [0, 2, 3, 4])
                  )
                );

                test(
                  'Is Set - false',
                  withKeystone(({ keystone }) =>
                    match(keystone, { [`${fieldName}_is_set`]: false }, [1, 5, 6])
                  )
                );
              }
            });
          }
        });
      });
  })
);
