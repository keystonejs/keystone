const globby = require('globby');
const path = require('path');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
import {
  createItem,
  createItems,
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
      .filter(({ skipCrudTest }) => !skipCrudTest)
      .forEach(mod => {
        const listKey = 'Test';
        const keystoneTestWrapper = (testFn = () => {}) =>
          runner(
            () => {
              const createLists = keystone => {
                // Create a list with all the fields required for testing
                keystone.createList(listKey, { fields: mod.getTestFields() });
              };
              return setupServer({ adapterName, createLists });
            },
            async ({ keystone, ...rest }) => {
              // Populate the database before running the tests
              await createItems({
                keystone,
                listKey,
                items: mod.initItems().map(x => ({ data: x })),
              });
              return testFn({ keystone, listKey, adapterName, ...rest });
            }
          );

        describe(`${mod.name} - CRUD operations`, () => {
          const { fieldName, exampleValue, exampleValue2 } = mod;
          const returnFields = `id name ${fieldName}`;
          const withHelpers = wrappedFn => {
            return async ({ keystone, listKey }) => {
              const items = await getItems({
                keystone,
                listKey,
                returnFields,
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
                    item: { name: 'Newly created', [fieldName]: exampleValue },
                    returnFields,
                  });
                  expect(data).not.toBe(null);
                  expect(data[fieldName]).toBe(exampleValue);
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
                  expect(data[fieldName]).toBe(items[0][fieldName]);
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
                        data: { [fieldName]: exampleValue2 },
                      },
                      returnFields,
                    });
                    expect(data).not.toBe(null);
                    expect(data[fieldName]).toBe(exampleValue2);
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
                    expect(data[fieldName]).toBe(items[0][fieldName]);
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
                  expect(data[fieldName]).toBe(items[0][fieldName]);

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
      });
  })
);
