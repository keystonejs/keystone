const globby = require('globby');
const path = require('path');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

describe('Fields', () => {
  const testModules = globby.sync(`packages/fields/src/types/**/test-fixtures.js`, {
    absolute: true,
  });
  testModules.push(path.resolve('packages/fields/tests/test-fixtures.js'));

  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`${adapterName} adapter`, () => {
      testModules.map(require).forEach(mod => {
        const listName = 'test';
        const keystoneTestWrapper = (testFn = () => {}) =>
          runner(
            () => {
              const name = `Field tests for ${mod.name} ${cuid()}`;
              const createLists = keystone => {
                // Create a list with all the fields required for testing
                const fields = mod.getTestFields();

                keystone.createList(listName, { fields });
              };
              return setupServer({ name, adapterName, createLists });
            },
            async ({ keystone, ...rest }) => {
              // Populate the database before running the tests
              await keystone.createItems({ [listName]: mod.initItems() });

              return testFn({ keystone, listName, adapterName, ...rest });
            }
          );

        describe(`${mod.name} field`, () => {
          if (mod.crudTests) {
            describe(`CRUD operations`, () => {
              mod.crudTests(keystoneTestWrapper);
            });
          } else {
            test.todo('CRUD operations - tests missing');
          }

          if (mod.filterTests) {
            describe(`Filtering`, () => {
              mod.filterTests(keystoneTestWrapper);
            });
          } else {
            test.todo('Filtering - tests missing');
          }
        });
      });
    })
  );
});
