const fs = require('fs');
const path = require('path');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer } = require('@keystone-alpha/test-utils');

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

describe('Test CRUD for all fields', () => {
  const typesLoc = path.resolve('packages/fields/src/types');
  const testModulePaths = fs
    .readdirSync(typesLoc)
    .map(name => `${typesLoc}/${name}/filterTests.js`)
    .filter(filename => fs.existsSync(filename));
  testModulePaths.push(path.resolve('packages/fields/tests/idFilterTests.js'));

  multiAdapterRunners().map(({ runner, adapterName }) => {
    // Skip tests for field adapters that don't exist
    const testModulesForAdapter = testModulePaths.map(require).filter(mod => {
      if (mod.name === 'ID') return true;
      if (mod.type && mod.type.adapters.hasOwnProperty(adapterName)) return true;
      console.log(`Skipping CRUD tests for ${mod.name}; no ${adapterName} field adapter supplied`);
      return false;
    });

    describe(`Adapter: ${adapterName}`, () => {
      testModulesForAdapter.forEach(mod => {
        describe(`All the CRUD tests for module: ${mod.name}`, () => {
          const listName = 'test';
          const keystoneTestWrapper = (testFn = () => {}) =>
            runner(
              () => {
                const name = `Field tests for ${mod.name} ${cuid}`;
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

                return testFn({ keystone, adapterName, ...rest });
              }
            );

          mod.filterTests(keystoneTestWrapper);
        });
      });
    });
  });
});
