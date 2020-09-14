const globby = require('globby');
const path = require('path');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
import {
  createItem,
  deleteItem,
  getItems,
  getItem,
  updateItem,
} from '@keystonejs/server-side-graphql-client';

const testModules = globby.sync(`packages/**/src/**/test-fixtures.js`, {
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
          const keystoneTestWrapper = (testFn = () => {}) =>
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
                for (const item of mod.initItems(matrixValue)) {
                  await createItem({ keystone, listKey, item });
                }
                return testFn({ keystone, listKey, adapterName, ...rest });
              }
            );

          if (mod.crudTests) {
            describe(`${mod.name} - ${matrixValue} - Custom CRUD operations`, () => {
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
              mod.crudTests(keystoneTestWrapper);
            });
          }

          if (!mod.skipCommonCrudTest) {
            describe(`${mod.name} - ${matrixValue} - CRUD operations`, () => {
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
              const {
                fieldName,
                exampleValue,
                exampleValue2,
                subfieldName,
                createReturnedValue,
                updateReturnedValue,
              } = mod;

              // Some  field types can have subfields
              const returnFields = subfieldName
                ? `id name ${fieldName} { ${subfieldName} }`
                : `id name ${fieldName}`;

              const withHelpers = wrappedFn => {
                return async ({ keystone, listKey }) => {
                  const items = await getItems({
                    keystone,
                    listKey,
                    returnFields,
                    sortBy: 'name_ASC',
                  });
                  return wrappedFn({ keystone, listKey, items });
                };
              };

              // Individual field types can have CRUD constraints.
              // For example, password field can only be written but not read.
              if (!mod.skipCreateTest) {
                test(
                  'Create',
                  keystoneTestWrapper(
                    withHelpers(async ({ keystone, listKey }) => {
                      const data = await createItem({
                        keystone,
                        listKey,
                        item: { name: 'Newly created', [fieldName]: exampleValue(matrixValue) },
                        returnFields,
                      });
                      expect(data).not.toBe(null);
                      expect(subfieldName ? data[fieldName][subfieldName] : data[fieldName]).toBe(
                        createReturnedValue ? createReturnedValue : exampleValue(matrixValue)
                      );
                    })
                  )
                );
              }

              if (!mod.skipReadTest) {
                test(
                  'Read',
                  keystoneTestWrapper(
                    withHelpers(async ({ keystone, listKey, items }) => {
                      const data = await getItem({
                        keystone,
                        listKey,
                        itemId: items[0].id,
                        returnFields,
                      });
                      expect(data).not.toBe(null);
                      expect(subfieldName ? data[fieldName][subfieldName] : data[fieldName]).toBe(
                        subfieldName ? items[0][fieldName][subfieldName] : items[0][fieldName]
                      );
                    })
                  )
                );
              }

              if (!mod.skipUpdateTest) {
                describe('Update', () => {
                  test(
                    'Updating the value',
                    keystoneTestWrapper(
                      withHelpers(async ({ keystone, items, listKey }) => {
                        const data = await updateItem({
                          keystone,
                          listKey,
                          item: {
                            id: items[0].id,
                            data: { [fieldName]: exampleValue2(matrixValue) },
                          },
                          returnFields,
                        });
                        expect(data).not.toBe(null);
                        expect(subfieldName ? data[fieldName][subfieldName] : data[fieldName]).toBe(
                          updateReturnedValue ? updateReturnedValue : exampleValue2(matrixValue)
                        );
                      })
                    )
                  );

                  test(
                    'Updating the value to null',
                    keystoneTestWrapper(
                      withHelpers(async ({ keystone, items, listKey }) => {
                        const data = await updateItem({
                          keystone,
                          listKey,
                          item: {
                            id: items[0].id,
                            data: { [fieldName]: null },
                          },
                          returnFields,
                        });
                        expect(data).not.toBe(null);
                        expect(data[fieldName]).toBe(null);
                      })
                    )
                  );

                  test(
                    'Updating without this field',
                    keystoneTestWrapper(
                      withHelpers(async ({ keystone, items, listKey }) => {
                        const data = await updateItem({
                          keystone,
                          listKey,
                          item: {
                            id: items[0].id,
                            data: { name: 'Updated value' },
                          },
                          returnFields,
                        });
                        expect(data).not.toBe(null);
                        expect(data.name).toBe('Updated value');
                        expect(subfieldName ? data[fieldName][subfieldName] : data[fieldName]).toBe(
                          subfieldName ? items[0][fieldName][subfieldName] : items[0][fieldName]
                        );
                      })
                    )
                  );
                });
              }

              if (!mod.skipDeleteTest) {
                test(
                  'Delete',
                  keystoneTestWrapper(
                    withHelpers(async ({ keystone, items, listKey }) => {
                      const data = await deleteItem({
                        keystone,
                        listKey,
                        itemId: items[0].id,
                        returnFields,
                      });
                      expect(data).not.toBe(null);
                      expect(data.name).toBe(items[0].name);
                      expect(subfieldName ? data[fieldName][subfieldName] : data[fieldName]).toBe(
                        subfieldName ? items[0][fieldName][subfieldName] : items[0][fieldName]
                      );

                      const allItems = await getItems({
                        keystone,
                        listKey,
                        returnFields,
                      });
                      expect(allItems).toEqual(expect.not.arrayContaining([data]));
                    })
                  )
                );
              }
            });
          }
        });
      });
  })
);
