const globby = require('globby');
const path = require('path');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
import { createItems } from '@keystonejs/server-side-graphql-client';

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

        if (mod.filterTests) {
          describe(`${mod.name} - Filtering`, () => {
            mod.filterTests(keystoneTestWrapper);
          });
        } else {
          test.todo(`${mod.name} - Filtering - tests missing`);
        }
      });
  })
);
