const globby = require('globby');
const path = require('path');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
import { createItem } from '@keystonejs/server-side-graphql-client';

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
                // Note: this seeding has to be in an order defined by the array returned by `mod.initItems()`
                for (const item of mod.initItems(matrixValue)) {
                  await createItem({ keystone, listKey, item });
                }
                return testFn({ keystone, listKey, adapterName, ...rest });
              }
            );

          if (mod.filterTests) {
            describe(`${mod.name} - ${matrixValue} - Filtering`, () => {
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
              mod.filterTests(keystoneTestWrapper, matrixValue);
            });
          } else {
            test.todo(`${mod.name} - Filtering - tests missing`);
          }
        });
      });
  })
);
